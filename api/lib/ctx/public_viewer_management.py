"""Aggregate public-viewer dismissal and listing operations."""

from models import PriceList, PublicViewer, PublicViewerDismissal
from models.base import utc_now


def record_anonymous_dismissal(tenant_id: str, list_id: str) -> bool:
    """Increment a dismissal count without identifying the visitor."""
    price_list = PriceList.get_or_none(
        (PriceList.id == list_id) & (PriceList.tenant == tenant_id)
    )
    if not price_list or not price_list.published or not price_list.capture_viewer_info:
        return False
    record, created = PublicViewerDismissal.get_or_create(
        tenant=tenant_id,
        price_list=price_list.id,
        defaults={"dismissal_count": 1, "last_seen_at": utc_now()},
    )
    if not created:
        record.dismissal_count += 1
        record.last_seen_at = utc_now()
        record.save()
    return True


def anonymous_dismissal_count(tenant_id: str) -> int:
    return sum(
        record.dismissal_count
        for record in PublicViewerDismissal.select().where(
            PublicViewerDismissal.tenant == tenant_id
        )
    )


def list_viewers(tenant_id: str) -> list[PublicViewer]:
    """Return identified viewers newest first, with list relations loaded."""
    return list(
        PublicViewer.select(PublicViewer, PriceList)
        .join(PriceList)
        .where(PublicViewer.tenant == tenant_id)
        .order_by(PublicViewer.last_seen_at.desc())
    )
