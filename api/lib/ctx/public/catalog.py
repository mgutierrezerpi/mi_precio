"""Catalog metadata overlay for public price-list item snapshots."""

from models import Item, Product


def product_details(tenant_id: str) -> dict[str, dict[str, str | bool | None]]:
    """Map current products by both id and normalized name."""
    details: dict[str, dict[str, str | bool | None]] = {}
    for product in Product.select(
        Product.id,
        Product.name,
        Product.available,
        Product.category,
        Product.description,
        Product.image_url,
        Product.image_thumb_url,
    ).where(Product.tenant == tenant_id):
        value = {
            "name": product.name,
            "available": product.available,
            "description": product.description,
            "category": product.category,
            "image_url": product.image_url,
            "image_thumb_url": product.image_thumb_url,
        }
        details[str(product.id)] = value
        details[normalized_name(product.name)] = value
    return details


def visible_items(
    items: list[Item], details: dict[str, dict[str, str | bool | None]]
) -> list[Item]:
    """Overlay catalog metadata and exclude unavailable products."""
    visible: list[Item] = []
    for item in items:
        product = details.get(str(item.product_id)) or details.get(
            normalized_name(item.name)
        )
        if product and not product["available"]:
            continue
        if product:
            item.name = product["name"]
            item.description = product["description"]
            item.category = product["category"]
            item.image_url = product["image_url"]
            item.image_thumb_url = product["image_thumb_url"]
        visible.append(item)
    return visible


def normalized_name(name: str) -> str:
    return (name or "").strip().lower()
