"""Versions context - list version operations."""

from datetime import datetime
from models import PriceList, ListVersion


def list_versions(list_id: str) -> list[ListVersion]:
    """Get all versions for a price list."""
    return list(ListVersion.select().where(ListVersion.list == list_id))


def get_version(version_id: str) -> ListVersion | None:
    """Get a version by ID."""
    return ListVersion.get_or_none(ListVersion.id == version_id)


def create_version(list_id: str, name: str) -> ListVersion | None:
    """Create a new version for a price list."""
    price_list = PriceList.get_or_none(PriceList.id == list_id)
    if not price_list:
        return None
    next_num = _next_version_number(list_id)
    return ListVersion.create(list=price_list, name=name, version_number=next_num)


def update_version(version_id: str, **updates) -> ListVersion | None:
    """Update a version. Publishing unpublishes other versions."""
    version = get_version(version_id)
    if not version:
        return None

    if updates.get("published"):
        _unpublish_others(version)
        version.published = True
        version.published_at = datetime.utcnow()
        updates.pop("published")
    elif updates.get("published") is False:
        version.published = False
        updates.pop("published")

    for key, value in updates.items():
        if value is not None:
            setattr(version, key, value)

    version.save()
    return version


def duplicate_version(version_id: str, name: str | None = None) -> ListVersion | None:
    """Duplicate a version with all its items."""
    version = get_version(version_id)
    if not version:
        return None

    new_version = version.duplicate(
        version_number=_next_version_number(version.list_id),
        name=name or f"{version.name} (copy)",
        published=False,
        published_at=None,
    )

    for item in version.items:
        item.duplicate(list_version=new_version)

    return new_version


def _next_version_number(list_id: str) -> int:
    """Get the next version number for a list."""
    last = (
        ListVersion.select()
        .where(ListVersion.list == list_id)
        .order_by(ListVersion.version_number.desc())
        .first()
    )
    return (last.version_number + 1) if last else 1


def _unpublish_others(version: ListVersion) -> None:
    """Unpublish all other versions for this list."""
    ListVersion.update(published=False).where(
        (ListVersion.list == version.list_id) & (ListVersion.id != version.id)
    ).execute()
