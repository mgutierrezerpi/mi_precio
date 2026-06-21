"""Public context - public-facing operations."""

from models import PriceList, ListVersion, Item, Product, Tenant
from lib.ctx.identity_context import find_tenant_by_subdomain
from lib.value_objects import PublishedList


def get_published_lists(tenant: Tenant) -> list[PublishedList]:
    """Get published lists with their published versions and items.

    Items and products are coupled only by name, so an item rarely carries its
    own image. When it doesn't, fall back to the matching product's image so the
    public storefront shows the picture the owner uploaded on the product.
    """
    product_images = _product_images_by_name(tenant.id)
    result = []
    for price_list in PriceList.select().where(
        (PriceList.tenant == tenant.id) & PriceList.published
    ):
        version = ListVersion.get_or_none(
            (ListVersion.list == price_list.id) & ListVersion.published
        )
        if version:
            items = list(version.items.order_by(Item.position))
            for item in items:
                if not item.image_url:
                    item.image_url = product_images.get(_norm_name(item.name))
            result.append(PublishedList(price_list, version, items))
    return result


def _product_images_by_name(tenant_id: str) -> dict[str, str]:
    """Map of normalized product name -> image URL for products that have one."""
    return {
        _norm_name(p.name): p.image_url
        for p in Product.select(Product.name, Product.image_url).where(
            (Product.tenant == tenant_id) & Product.image_url.is_null(False)
        )
        if p.image_url
    }


def _norm_name(name: str) -> str:
    return (name or "").strip().lower()


def get_tenant_by_subdomain(subdomain: str) -> Tenant | None:
    """Get tenant by subdomain for public access."""
    return find_tenant_by_subdomain(subdomain)
