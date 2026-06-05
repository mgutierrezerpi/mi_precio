"""Products context - tenant-level product catalog operations."""

from models import Tenant, Product


def list_products(tenant_id: str) -> list[Product]:
    """Get all products for a tenant, ordered by position."""
    return list(
        Product.select()
        .where(Product.tenant == tenant_id)
        .order_by(Product.position, Product.created_at)
    )


def get_product(product_id: str) -> Product | None:
    """Get a product by ID."""
    return Product.get_or_none(Product.id == product_id)


def create_product(tenant_id: str, **attrs) -> Product | None:
    """Create a new product for a tenant."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return None
    return Product.create(
        tenant=tenant,
        position=_next_position(tenant_id),
        **attrs,
    )


def update_product(product_id: str, **updates) -> Product | None:
    """Update a product's properties.

    `updates` only contains fields the client explicitly sent (the controller
    uses `exclude_unset`), so every one is applied — including `None`/empty,
    which lets the client clear optional fields (sku, category, description…).
    """
    product = get_product(product_id)
    if not product:
        return None
    for key, value in updates.items():
        setattr(product, key, value)
    product.save()
    return product


def delete_product(product_id: str) -> bool:
    """Delete a product."""
    product = get_product(product_id)
    if not product:
        return False
    product.delete_instance()
    return True


def _next_position(tenant_id: str) -> int:
    """Get the next position for a new product."""
    last = (
        Product.select()
        .where(Product.tenant == tenant_id)
        .order_by(Product.position.desc())
        .first()
    )
    return (last.position + 1) if last else 0
