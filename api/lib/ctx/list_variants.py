"""Snapshot copying for child price-list variants."""

from models import Item, ListVersion, PriceList


def copy_parent_snapshot(parent: PriceList, target: ListVersion) -> None:
    """Copy the parent's newest published version and its items into target."""
    source = (
        ListVersion.select()
        .where(ListVersion.list == parent.id)
        .order_by(ListVersion.published.desc(), ListVersion.version_number.desc())
        .first()
    )
    if not source:
        return
    target.content = source.content
    target.content_revision = 0
    target.save()
    for item in source.items.order_by(Item.position):
        item.duplicate(list_version=target)
