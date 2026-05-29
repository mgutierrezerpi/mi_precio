"""Public context - public-facing operations."""

from models import PriceList, ListVersion, Item, Tenant
from lib.ctx.identity_context import find_tenant_by_subdomain
from lib.value_objects import PublishedList


def get_published_lists(tenant: Tenant) -> list[PublishedList]:
    """Get published lists with their published versions and items."""
    result = []
    for price_list in PriceList.select().where(
        (PriceList.tenant == tenant.id) & PriceList.published
    ):
        version = ListVersion.get_or_none(
            (ListVersion.list == price_list.id) & ListVersion.published
        )
        if version:
            items = list(version.items.order_by(Item.position))
            result.append(PublishedList(price_list, version, items))
    return result


def get_tenant_by_subdomain(subdomain: str) -> Tenant | None:
    """Get tenant by subdomain for public access."""
    return find_tenant_by_subdomain(subdomain)
