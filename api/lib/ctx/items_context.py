"""Items context - item operations."""

from models import ListVersion, Item


def list_items(version_id: str) -> list[Item]:
    """Get all items for a version, ordered by position."""
    return list(
        Item.select()
        .where(Item.list_version == version_id)
        .order_by(Item.position)
    )


def get_item(item_id: str) -> Item | None:
    """Get an item by ID."""
    return Item.get_or_none(Item.id == item_id)


def create_item(version_id: str, **attrs) -> Item | None:
    """Create a new item in a version."""
    version = ListVersion.get_or_none(ListVersion.id == version_id)
    if not version:
        return None
    return Item.create(
        list_version=version,
        position=_next_position(version_id),
        **attrs,
    )


def update_item(item_id: str, **updates) -> Item | None:
    """Update an item's properties."""
    item = get_item(item_id)
    if not item:
        return None
    for key, value in updates.items():
        if value is not None:
            setattr(item, key, value)
    item.save()
    return item


def delete_item(item_id: str) -> bool:
    """Delete an item."""
    item = get_item(item_id)
    if not item:
        return False
    item.delete_instance()
    return True


def reorder_items(version_id: str, item_ids: list[str]) -> bool:
    """Reorder items by updating their positions."""
    for position, item_id in enumerate(item_ids):
        Item.update(position=position).where(
            (Item.id == item_id) & (Item.list_version == version_id)
        ).execute()
    return True


def _next_position(version_id: str) -> int:
    """Get the next position for a new item."""
    last = (
        Item.select()
        .where(Item.list_version == version_id)
        .order_by(Item.position.desc())
        .first()
    )
    return (last.position + 1) if last else 0
