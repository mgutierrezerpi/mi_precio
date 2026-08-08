"""Lists context - price list operations."""

from datetime import datetime

from models import Customer, Item, PriceList, ListVersion
from models.price_list import unique_list_slug
from lib.ctx.identity_context import get_tenant
from lib.value_objects import CreatedList


def list_lists(tenant_id: str) -> list[PriceList]:
    """Get all price lists for a tenant."""
    return list(PriceList.select().where(PriceList.tenant == tenant_id))


def get_list(list_id: str) -> PriceList | None:
    """Get a price list by ID."""
    return PriceList.get_or_none(PriceList.id == list_id)


def create_list(
    tenant_id: str,
    name: str,
    kind: str = "product",
    parent_list_id: str | None = None,
    variant_type: str | None = None,
    customer_id: str | None = None,
    starts_at: datetime | None = None,
    ends_at: datetime | None = None,
) -> CreatedList | None:
    """Create a root list or a snapshot-based child variant.

    Variants copy the latest source version and its items so later changes to the
    parent never silently change a customer agreement or time-limited promotion.
    """
    tenant = get_tenant(tenant_id)
    if not tenant:
        return None
    kind = kind if kind in ("product", "service") else "product"

    parent = None
    customer = None
    if parent_list_id:
        parent = PriceList.get_or_none(
            (PriceList.id == parent_list_id) & (PriceList.tenant == tenant_id)
        )
        if not parent or parent.parent_list_id:
            return None
        kind = parent.kind
        if variant_type is None:
            variant_type = "custom"
    elif any((variant_type, customer_id, starts_at, ends_at)):
        return None

    if customer_id:
        customer = Customer.get_or_none(
            (Customer.id == customer_id) & (Customer.tenant == tenant_id)
        )
        if not customer:
            return None
    if ends_at and starts_at and ends_at <= starts_at:
        return None

    price_list = PriceList.create(
        tenant=tenant,
        name=name,
        kind=kind,
        parent_list=parent,
        variant_type=variant_type,
        customer=customer,
        starts_at=starts_at,
        ends_at=ends_at,
    )
    version = ListVersion.create(list=price_list, name="v1", version_number=1)

    if parent:
        source = (
            ListVersion.select()
            .where(ListVersion.list == parent.id)
            .order_by(ListVersion.published.desc(), ListVersion.version_number.desc())
            .first()
        )
        if source:
            version.content = source.content
            version.content_revision = 0
            version.save()
            for item in source.items.order_by(Item.position):
                item.duplicate(list_version=version)

    return CreatedList(price_list, version)


def update_list(list_id: str, **updates) -> PriceList | None:
    """Update a price list's properties."""
    price_list = get_list(list_id)
    if not price_list:
        return None

    # Check if we're changing published status
    publishing = updates.get("published")

    if "parent_list_id" in updates:
        parent_id = updates["parent_list_id"]
        if parent_id:
            parent = PriceList.get_or_none(
                (PriceList.id == parent_id) & (PriceList.tenant == price_list.tenant_id)
            )
            if not parent or parent.id == price_list.id or parent.parent_list_id:
                return None
            updates["parent_list"] = parent
            updates.pop("parent_list_id")
            if not price_list.variant_type:
                updates["variant_type"] = "custom"
        else:
            updates["parent_list"] = None
            updates.pop("parent_list_id")
            updates["variant_type"] = None

    if updates.get("name") and not updates.get("slug"):
        updates["slug"] = unique_list_slug(
            price_list.tenant_id, updates["name"], price_list.id
        )

    if updates.get("slug"):
        updates["slug"] = unique_list_slug(
            price_list.tenant_id, updates["slug"], price_list.id
        )

    # Appearance overrides are nullable on purpose: sending null clears them so
    # the list goes back to inheriting the tenant default. The rest keep their
    # current value rather than being blanked out.
    clearable = {"design", "hero_color", "bg_url", "bg_overlay"}
    for key, value in updates.items():
        if value is None and key not in clearable:
            continue
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
