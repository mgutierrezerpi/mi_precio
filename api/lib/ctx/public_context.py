"""Public context - public-facing operations."""

from lib.ctx import plans_context as plans
from lib.ctx.identity_context import find_tenant_by_subdomain
from lib.ctx.marketplace_context import nearby_marketplace_tenants
from lib.ctx.public_catalog import product_details, visible_items
from lib.value_objects import PublishedList
from models import Item, ListVersion, Magazine, PriceList, Tenant

__all__ = [
    "get_public_magazine",
    "get_published_lists",
    "get_published_magazines",
    "get_tenant_by_subdomain",
    "live_list_ids",
    "nearby_marketplace_tenants",
]


def live_list_ids(tenant: Tenant) -> list[str]:
    """Ids of the published lists the tenant's plan actually allows on air.

    Publishing is the owner's intent; the plan decides how much of that intent is
    served. When a plan no longer covers everything that is published we keep the
    oldest lists — the main catalogue is almost always the first one created, and
    silently dropping it would be worse than dropping a recent addition.

    Nothing is unpublished to make this true: paying again restores the whole
    storefront on its own, with no republishing to do.
    """
    published = list(
        PriceList.select(PriceList.id)
        .where(
            (PriceList.tenant == tenant.id)
            & PriceList.published
            & (PriceList.design.is_null(True) | (PriceList.design != "pencil-journal"))
        )
        .order_by(PriceList.created_at, PriceList.id)
    )
    allowance = plans.live_list_allowance(tenant)
    if allowance is not None:
        published = published[:allowance]
    return [price_list.id for price_list in published]


def get_published_lists(
    tenant: Tenant, requested_list: str | None = None
) -> list[PublishedList]:
    """Get plan-allowed published lists with their versions and items.

    Catalog-linked items inherit the current product metadata. A name-based
    fallback keeps older rows working while the startup backfill completes.
    The tenant-wide index is capped by the plan; an explicitly shared list URL
    remains reachable so existing QR codes and shared variants keep working.
    """
    allowed = live_list_ids(tenant)
    if not allowed:
        return []

    products = product_details(tenant.id)
    conditions = [
        (PriceList.tenant == tenant.id),
        PriceList.published,
        PriceList.design.is_null(True) | (PriceList.design != "pencil-journal"),
    ]
    if requested_list:
        # A directly shared variant remains reachable by its own URL. The plan
        # allowance applies to the tenant-wide index, not to an explicit link.
        conditions.append(
            (PriceList.id == requested_list) | (PriceList.slug == requested_list)
        )
    else:
        conditions.extend(
            [
                PriceList.id << allowed,
                PriceList.parent_list.is_null(True),
                PriceList.is_private == False,  # noqa: E712
            ]
        )

    result = []
    for price_list in (
        PriceList.select()
        .where(*conditions)
        .order_by(PriceList.created_at, PriceList.id)
    ):
        version = ListVersion.get_or_none(
            (ListVersion.list == price_list.id) & ListVersion.published
        )
        if version:
            items = list(version.items.order_by(Item.position))
            result.append(
                PublishedList(price_list, version, visible_items(items, products))
            )
    return result


def get_tenant_by_subdomain(subdomain: str) -> Tenant | None:
    """Get tenant by subdomain for public access."""
    return find_tenant_by_subdomain(subdomain)


def get_published_magazines(
    tenant: Tenant, requested_magazine: str | None = None
) -> list[Magazine]:
    from lib.ctx import magazines_context

    return magazines_context.get_published_magazines(tenant, requested_magazine)


def get_public_magazine(tenant: Tenant, requested_magazine: str) -> Magazine | None:
    from lib.ctx import magazines_context

    return magazines_context.get_public_magazine(tenant, requested_magazine)
