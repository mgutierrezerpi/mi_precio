"""Public context - public-facing operations."""

from math import asin, cos, radians, sin, sqrt

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
            visible_items = []
            for item in items:
                fallback = product_details.get(
                    str(item.product_id)
                ) or product_details.get(_norm_name(item.name))
                if fallback and not fallback["available"]:
                    # Disabling a catalog product removes it from every public list.
                    # Name matching keeps this behavior consistent for legacy items
                    # created before product_id was stored on list items.
                    continue
                if fallback:
                    # Products are the source of truth for catalog-linked details.
                    item.description = fallback["description"]
                    if not item.image_url:
                        item.image_url = fallback["image_url"]
                    if not item.image_thumb_url:
                        item.image_thumb_url = fallback["image_thumb_url"]
                visible_items.append(item)
            result.append(PublishedList(price_list, version, visible_items))
    return result


def _product_details(tenant_id: str) -> dict[str, dict[str, str | bool | None]]:
    """Map products by id and name for current catalog details and availability."""
    details: dict[str, dict[str, str | bool | None]] = {}
    for product in Product.select(
        Product.id,
        Product.name,
        Product.available,
        Product.description,
        Product.image_url,
        Product.image_thumb_url,
    ).where(Product.tenant == tenant_id):
        value = {
            "available": product.available,
            "description": product.description,
            "image_url": product.image_url,
            "image_thumb_url": product.image_thumb_url,
        }
        details[str(product.id)] = value
        details[_norm_name(product.name)] = value
    return details


def _norm_name(name: str) -> str:
    return (name or "").strip().lower()


def nearby_marketplace_tenants(
    latitude: float | None = None,
    longitude: float | None = None,
    limit: int = 50,
    category: str | None = None,
):
    """Return opted-in businesses, sorting by proximity when coordinates exist.

    The data set is intentionally kept small and the distance calculation is
    done here, avoiding database-specific geo extensions. Without visitor
    coordinates, all opted-in businesses are returned without a distance.
    """
    candidates = Tenant.select().where(Tenant.marketplace_enabled)
    if category:
        candidates = candidates.where(Tenant.business_category == category)
    results = []
    for tenant in candidates:
        if latitude is None or longitude is None:
            distance = None
        else:
            try:
                distance = round(
                    _distance_km(
                        latitude,
                        longitude,
                        float(tenant.marketplace_latitude),
                        float(tenant.marketplace_longitude),
                    ),
                    1,
                )
            except (TypeError, ValueError):
                distance = None
        results.append((tenant, distance))
    return sorted(results, key=lambda result: (result[1] is None, result[1] or 0))[:limit]


def _distance_km(lat_a: float, lon_a: float, lat_b: float, lon_b: float) -> float:
    """Great-circle distance in kilometres (Haversine formula)."""
    d_lat = radians(lat_b - lat_a)
    d_lon = radians(lon_b - lon_a)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat_a)) * cos(radians(lat_b)) * sin(d_lon / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


def get_tenant_by_subdomain(subdomain: str) -> Tenant | None:
    """Get tenant by subdomain for public access."""
    return find_tenant_by_subdomain(subdomain)
