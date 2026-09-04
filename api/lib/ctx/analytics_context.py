"""Analytics context for public page view tracking and visit reports."""

from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from lib.ctx.analytics_sales import paid_revenue, top_products
from models import Customer, PageView, PriceList, Tenant

VALID_SOURCES = {"qr", "link"}


def _tenant_timezone(tenant_id: str) -> ZoneInfo:
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    try:
        return ZoneInfo(tenant.timezone if tenant and tenant.timezone else "America/Montevideo")
    except ZoneInfoNotFoundError:
        return ZoneInfo("America/Montevideo")


def _local_day_start_utc(
    timezone: ZoneInfo, now: datetime | None = None, days_ago: int = 0
) -> datetime:
    """The current local midnight, represented as naive UTC for SQLite."""
    local_now = (now or datetime.now(UTC)).astimezone(timezone)
    local_midnight = (
        local_now.replace(hour=0, minute=0, second=0, microsecond=0)
        - timedelta(days=days_ago)
    )
    return local_midnight.astimezone(UTC).replace(tzinfo=None)


def _local_date(value: datetime, timezone: ZoneInfo) -> str:
    """Convert database timestamps (stored as naive UTC) into a tenant date."""
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    return value.astimezone(timezone).strftime("%Y-%m-%d")


def _count_views(tenant_id: str, *conditions: object) -> int:
    query = PageView.select().where(PageView.tenant == tenant_id)
    for condition in conditions:
        query = query.where(condition)
    return query.count()


def _visit_bucket(tenant_id: str, *conditions: object) -> dict:
    start_today = _local_day_start_utc(_tenant_timezone(tenant_id))
    start_yesterday = start_today - timedelta(days=1)
    today = _count_views(tenant_id, PageView.created_at >= start_today, *conditions)
    yesterday = _count_views(
        tenant_id,
        PageView.created_at >= start_yesterday,
        PageView.created_at < start_today,
        *conditions,
    )
    change = (
        (today - yesterday) / yesterday * 100
        if yesterday
        else (100.0 if today else 0.0)
    )
    return {
        "today": today,
        "yesterday": yesterday,
        "total": _count_views(tenant_id, *conditions),
        "change_pct": round(change),
    }


def record_view(
    tenant_id: str,
    list_id: str | None = None,
    source: str | None = None,
    customer_id: str | None = None,
) -> None:
    """Record a visit to a tenant public page with its entry channel."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if tenant:
        PageView.create(
            tenant=tenant,
            list_id=list_id,
            source=source if source in VALID_SOURCES else "link",
            customer_id=customer_id,
        )


def visit_stats(tenant_id: str) -> dict:
    """Return overall and QR visit buckets for the tenant's current local day."""
    overall = _visit_bucket(tenant_id)
    return {**overall, "qr": _visit_bucket(tenant_id, PageView.source == "qr")}


def _authorized_list_id(tenant_id: str, list_id: str | None) -> str | None:
    if not list_id:
        return None
    is_tenant_list = PriceList.get_or_none(
        (PriceList.id == list_id) & (PriceList.tenant == tenant_id)
    )
    return list_id if is_tenant_list else None


def _view_conditions(
    tenant_id: str, list_id: str | None, customer_id: str | None = None
) -> list[object]:
    conditions: list[object] = [PageView.tenant == tenant_id]
    if list_id:
        conditions.append(PageView.list_id == list_id)
    if customer_id:
        conditions.append(PageView.customer_id == customer_id)
    return conditions


def _empty_series(window_start: datetime, days: int, timezone: ZoneInfo) -> list[dict]:
    first_day = date.fromisoformat(_local_date(window_start, timezone))
    return [
        {
            "date": (first_day + timedelta(days=offset)).isoformat(),
            "link": 0,
            "qr": 0,
        }
        for offset in range(days)
    ]


def _view_series(
    conditions: list[object], window_start: datetime, days: int, timezone: ZoneInfo
) -> tuple[list[dict], dict]:
    series = _empty_series(window_start, days, timezone)
    dates = {row["date"]: row for row in series}
    channels = {"link": 0, "qr": 0}
    views = PageView.select(PageView.source, PageView.created_at).where(*conditions)
    for view in views:
        created = view.created_at
        if not isinstance(created, datetime):
            created = datetime.fromisoformat(str(created))
        source = "qr" if view.source == "qr" else "link"
        channels[source] += 1
        if day := dates.get(_local_date(created, timezone)):
            day[source] += 1
    return series, channels


def reports(
    tenant_id: str,
    days: int = 30,
    list_id: str | None = None,
    customer_id: str | None = None,
) -> dict:
    """Return report KPIs, traffic channels, daily series, and paid product sales."""
    days = max(1, min(days, 365))
    list_id = _authorized_list_id(tenant_id, list_id)
    customer_id = (
        customer_id
        if customer_id
        and Customer.select()
        .where((Customer.id == customer_id) & (Customer.tenant == tenant_id))
        .exists()
        else None
    )
    timezone = _tenant_timezone(tenant_id)
    window_start = _local_day_start_utc(timezone, days_ago=days - 1)
    total_conditions = _view_conditions(tenant_id, list_id, customer_id)
    window_conditions = [*total_conditions, PageView.created_at >= window_start]
    series, channels = _view_series(window_conditions, window_start, days, timezone)
    visits_total = _count_views(tenant_id, *total_conditions[1:])
    qr_total = _count_views(tenant_id, *total_conditions[1:], PageView.source == "qr")

    return {
        "days": days,
        "list_id": list_id,
        "customer_id": customer_id,
        "kpis": {
            "visits": visits_total,
            "qr_scans": qr_total,
            "customers": Customer.select().where(Customer.tenant == tenant_id).count(),
            "revenue": str(paid_revenue(tenant_id)),
        },
        "series": series,
        "channels": channels,
        "top_products": top_products(tenant_id),
    }
