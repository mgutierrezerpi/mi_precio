"""Analytics context - public page-view tracking and visit stats."""

from datetime import datetime, timedelta
from models import Tenant, PageView


def record_view(tenant_id: str, list_id: str | None = None) -> None:
    """Record a visit to a tenant's public page."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return
    PageView.create(tenant=tenant, list_id=list_id)


def visit_stats(tenant_id: str) -> dict:
    """Visits today, yesterday, total, and day-over-day % change (UTC days)."""
    now = datetime.utcnow()
    start_today = datetime(now.year, now.month, now.day)
    start_yesterday = start_today - timedelta(days=1)

    def count(*conditions) -> int:
        q = PageView.select().where(PageView.tenant == tenant_id)
        for cond in conditions:
            q = q.where(cond)
        return q.count()

    today = count(PageView.created_at >= start_today)
    yesterday = count(PageView.created_at >= start_yesterday, PageView.created_at < start_today)
    total = count()

    if yesterday > 0:
        change = (today - yesterday) / yesterday * 100
    elif today > 0:
        change = 100.0
    else:
        change = 0.0

    return {"today": today, "yesterday": yesterday, "total": total, "change_pct": round(change)}
