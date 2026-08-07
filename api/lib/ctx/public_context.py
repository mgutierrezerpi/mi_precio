"""Public context - public-facing operations."""

from models import PriceList, ListVersion, Item, Product, Tenant
from lib.ctx.identity_context import find_tenant_by_subdomain
from lib.value_objects import PublishedList


def get_published_lists(
    tenant: Tenant, requested_list: str | None = None
) -> list[PublishedList]:
    """Get published lists with their published versions and items.

    Catalog-linked items inherit the current product description and image. A
    name-based fallback keeps older items working when they predate product IDs.
    """
    product_details = _product_details(tenant.id)
    result = []
    # Variants stay hidden from the tenant-wide catalog. Their own ID/slug URL
    # may resolve one published variant, which is how special lists are shared.
    conditions = [(PriceList.tenant == tenant.id) & PriceList.published]
    if requested_list:
        conditions.append(
            (PriceList.id == requested_list) | (PriceList.slug == requested_list)
        )
    else:
        conditions.append(PriceList.parent_list.is_null(True))
    for price_list in PriceList.select().where(*conditions):
        version = ListVersion.get_or_none(
            (ListVersion.list == price_list.id) & ListVersion.published
        )
        if version:
            items = list(version.items.order_by(Item.position))
            for item in items:
                fallback = product_details.get(
                    str(item.product_id)
                ) or product_details.get(_norm_name(item.name))
                if fallback:
                    # Products are the source of truth for catalog-linked details.
                    item.description = fallback["description"]
                    if not item.image_url:
                        item.image_url = fallback["image_url"]
                    if not item.image_thumb_url:
                        item.image_thumb_url = fallback["image_thumb_url"]
            result.append(PublishedList(price_list, version, items))
    return result


def _product_details(tenant_id: str) -> dict[str, dict[str, str | None]]:
    """Map products by id and name for current catalog details and image fallbacks."""
    details: dict[str, dict[str, str | None]] = {}
    for product in Product.select(
        Product.id,
        Product.name,
        Product.description,
        Product.image_url,
        Product.image_thumb_url,
    ).where(Product.tenant == tenant_id):
        value = {
            "description": product.description,
            "image_url": product.image_url,
            "image_thumb_url": product.image_thumb_url,
        }
        details[str(product.id)] = value
        details[_norm_name(product.name)] = value
    return details


def _norm_name(name: str) -> str:
    return (name or "").strip().lower()


def get_tenant_by_subdomain(subdomain: str) -> Tenant | None:
    """Get tenant by subdomain for public access."""
    return find_tenant_by_subdomain(subdomain)
