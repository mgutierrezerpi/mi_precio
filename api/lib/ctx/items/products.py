"""Catalog-product lookup helpers used while creating list items."""

from models import Product


def find_product(tenant_id: str, name: str) -> Product | None:
    normalized = name.strip().casefold()
    for product in Product.select().where(Product.tenant == tenant_id):
        if product.name.strip().casefold() == normalized:
            return product
    return None


def next_product_position(tenant_id: str) -> int:
    last = (
        Product.select()
        .where(Product.tenant == tenant_id)
        .order_by(Product.position.desc())
        .first()
    )
    return (last.position + 1) if last else 0
