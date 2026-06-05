"""Lists context - price list operations."""

from models import PriceList, ListVersion
from models.price_list import unique_list_slug
from lib.ctx.identity_context import get_tenant
from lib.value_objects import CreatedList


def list_lists(tenant_id: str) -> list[PriceList]:
    """Get all price lists for a tenant."""
    return list(PriceList.select().where(PriceList.tenant == tenant_id))


def get_list(list_id: str) -> PriceList | None:
    """Get a price list by ID."""
    return PriceList.get_or_none(PriceList.id == list_id)


def create_list(tenant_id: str, name: str, kind: str = "product") -> CreatedList | None:
    """Create a new price list with an initial version."""
    tenant = get_tenant(tenant_id)
    if not tenant:
        return None
    kind = kind if kind in ("product", "service") else "product"
    price_list = PriceList.create(tenant=tenant, name=name, kind=kind)
    version = ListVersion.create(list=price_list, name="v1", version_number=1)
    return CreatedList(price_list, version)


def update_list(list_id: str, **updates) -> PriceList | None:
    """Update a price list's properties."""
    price_list = get_list(list_id)
    if not price_list:
        return None

    # Check if we're changing published status
    publishing = updates.get("published")

    if updates.get("name") and not updates.get("slug"):
        updates["slug"] = unique_list_slug(price_list.tenant_id, updates["name"], price_list.id)

    if updates.get("slug"):
        updates["slug"] = unique_list_slug(price_list.tenant_id, updates["slug"], price_list.id)

    for key, value in updates.items():
        if value is not None:
            setattr(price_list, key, value)
    price_list.save()

    # Also update all versions' published status to match
    if publishing is not None:
        ListVersion.update(published=publishing).where(
            ListVersion.list == price_list.id
        ).execute()

    return price_list


def delete_list(list_id: str) -> bool:
    """Delete a price list."""
    price_list = get_list(list_id)
    if not price_list:
        return False
    price_list.delete_instance()
    return True
