"""Analytics context for public page view tracking and visit reports."""

from datetime import UTC, datetime, timedelta

from lib.ctx.analytics_sales import paid_revenue, top_products
from models import Customer, PageView, PriceList, Tenant

VALID_SOURCES = {"qr", "link"}


def _utc_day_start() -> datetime:
    now = datetime.now(UTC)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def _count_views(tenant_id: str, *conditions: object) -> int:
    query = PageView.select().where(PageView.tenant == tenant_id)
    for condition in conditions:
        query = query.where(condition)
    return query.count()


def _visit_bucket(tenant_id: str, *conditions: object) -> dict:
    start_today = _utc_day_start()
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
    tenant_id: str, list_id: str | None = None, source: str | None = None
) -> None:
    """Record a visit to a tenant public page with its entry channel."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if tenant:
        PageView.create(
            tenant=tenant,
            list_id=list_id,
            source=source if source in VALID_SOURCES else "link",
        )


def visit_stats(tenant_id: str) -> dict:
    """Return overall and QR specific visit buckets for the current UTC day."""
    overall = _visit_bucket(tenant_id)
    return {**overall, "qr": _visit_bucket(tenant_id, PageView.source == "qr")}


def _authorized_list_id(tenant_id: str, list_id: str | None) -> str | None:
    if not list_id:
        return None
    is_tenant_list = PriceList.get_or_none(
        (PriceList.id == list_id) & (PriceList.tenant == tenant_id)
    )
    return list_id if is_tenant_list else None


def _view_conditions(tenant_id: str, list_id: str | None) -> list[object]:
    conditions: list[object] = [PageView.tenant == tenant_id]
    if list_id:
        conditions.append(PageView.list_id == list_id)
    return conditions


def _empty_series(window_start: datetime, days: int) -> list[dict]:
    return [
        {
            "date": (window_start + timedelta(days=offset)).strftime("%Y-%m-%d"),
            "link": 0,
            "qr": 0,
        }
        for offset in range(days)
    ]


def _view_series(
    conditions: list[object], window_start: datetime, days: int
) -> tuple[list[dict], dict]:
    series = _empty_series(window_start, days)
    dates = {row["date"]: row for row in series}
    channels = {"link": 0, "qr": 0}
    views = PageView.select(PageView.source, PageView.created_at).where(*conditions)
    for view in views:
        created = view.created_at
        if not isinstance(created, datetime):
            created = datetime.fromisoformat(str(created))
        source = "qr" if view.source == "qr" else "link"
        channels[source] += 1
        if day := dates.get(created.strftime("%Y-%m-%d")):
            day[source] += 1
    return series, channels


def reports(tenant_id: str, days: int = 30, list_id: str | None = None) -> dict:
    """Return report KPIs, traffic channels, daily series, and paid product sales."""
    days = max(1, min(days, 365))
    list_id = _authorized_list_id(tenant_id, list_id)
    window_start = _utc_day_start() - timedelta(days=days - 1)
    total_conditions = _view_conditions(tenant_id, list_id)
    window_conditions = [*total_conditions, PageView.created_at >= window_start]
    series, channels = _view_series(window_conditions, window_start, days)
    visits_total = _count_views(tenant_id, *total_conditions[1:])
    qr_total = _count_views(tenant_id, *total_conditions[1:], PageView.source == "qr")

    return {
        "days": days,
        "list_id": list_id,
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
