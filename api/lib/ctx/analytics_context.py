"""Analytics context - public page-view tracking and visit stats."""

from datetime import datetime, timedelta
from models import Tenant, PageView

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
