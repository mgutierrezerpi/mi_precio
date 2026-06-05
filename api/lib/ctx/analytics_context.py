"""Analytics context - public page-view tracking and visit stats."""

from datetime import datetime, timedelta
from decimal import Decimal

from peewee import fn

from models import Tenant, PageView, Customer, Order, OrderItem

# Accepted traffic sources; anything else is normalized to "link".
VALID_SOURCES = {"qr", "link"}


def record_view(tenant_id: str, list_id: str | None = None, source: str | None = None) -> None:
    """Record a visit to a tenant's public page, tagged by how the visitor arrived."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return
    src = source if source in VALID_SOURCES else "link"
    PageView.create(tenant=tenant, list_id=list_id, source=src)


def visit_stats(tenant_id: str) -> dict:
    """Overall and QR-only visit buckets: today, yesterday, total, day-over-day % change (UTC)."""
    now = datetime.utcnow()
    start_today = datetime(now.year, now.month, now.day)
    start_yesterday = start_today - timedelta(days=1)

    def count(*conditions) -> int:
        q = PageView.select().where(PageView.tenant == tenant_id)
        for cond in conditions:
            q = q.where(cond)
        return q.count()

    def bucket(*extra) -> dict:
        today = count(PageView.created_at >= start_today, *extra)
        yesterday = count(PageView.created_at >= start_yesterday, PageView.created_at < start_today, *extra)
        total = count(*extra)
        if yesterday > 0:
            change = (today - yesterday) / yesterday * 100
        elif today > 0:
            change = 100.0
        else:
            change = 0.0
        return {"today": today, "yesterday": yesterday, "total": total, "change_pct": round(change)}

    overall = bucket()
    # Top-level keys keep the overall visits (backwards compatible); "qr" holds the QR-only split.
    return {**overall, "qr": bucket(PageView.source == "qr")}


def reports(tenant_id: str, days: int = 30) -> dict:
    """Aggregated analytics for the Reports screen: KPIs, a daily visit series,
    the channel split (QR vs link) and the best-selling products."""
    days = max(1, min(days, 365))
    now = datetime.utcnow()
    start_today = datetime(now.year, now.month, now.day)
    # Inclusive window of `days` days ending today (e.g. 30 → 29 days ago … today).
    window_start = start_today - timedelta(days=days - 1)

    # ── Page views in the window, bucketed per day and per channel ──────────
    views = list(
        PageView.select(PageView.source, PageView.created_at)
        .where(PageView.tenant == tenant_id, PageView.created_at >= window_start)
    )

    # One bucket per day so the series has no gaps even on days with no traffic.
    series = [
        {"date": (window_start + timedelta(days=i)).strftime("%Y-%m-%d"), "link": 0, "qr": 0}
        for i in range(days)
    ]
    index = {row["date"]: row for row in series}
    channels = {"link": 0, "qr": 0}
    for v in views:
        created = v.created_at if isinstance(v.created_at, datetime) else datetime.fromisoformat(str(v.created_at))
        key = "qr" if v.source == "qr" else "link"
        channels[key] += 1
        day = index.get(created.strftime("%Y-%m-%d"))
        if day is not None:
            day[key] += 1

    # ── KPIs ────────────────────────────────────────────────────────────────
    visits_total = PageView.select().where(PageView.tenant == tenant_id).count()
    qr_total = PageView.select().where(PageView.tenant == tenant_id, PageView.source == "qr").count()
    customers_total = Customer.select().where(Customer.tenant == tenant_id).count()
    revenue = (
        Order.select(fn.COALESCE(fn.SUM(Order.total), 0))
        .where(Order.tenant == tenant_id, Order.status == "paid")
        .scalar()
    ) or Decimal(0)

    # ── Best-selling products (paid orders, by units sold) ──────────────────
    rows = (
        OrderItem.select(
            OrderItem.name,
            fn.SUM(OrderItem.quantity).alias("units"),
            fn.SUM(OrderItem.quantity * OrderItem.unit_price).alias("revenue"),
        )
        .join(Order)
        .where(Order.tenant == tenant_id, Order.status == "paid")
        .group_by(OrderItem.name)
        .order_by(fn.SUM(OrderItem.quantity).desc())
        .limit(5)
        .dicts()
    )
    top_products = [
        {"name": r["name"], "units": int(r["units"] or 0), "revenue": str(r["revenue"] or 0)}
        for r in rows
    ]

    return {
        "days": days,
        "kpis": {
            "visits": visits_total,
            "qr_scans": qr_total,
            "customers": customers_total,
            "revenue": str(revenue),
        },
        "series": series,
        "channels": channels,
        "top_products": top_products,
    }
