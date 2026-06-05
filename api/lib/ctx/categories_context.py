"""Categories context - tenant-level category operations (with product cascade)."""

from models import Tenant, Category, Product


def list_categories(tenant_id: str) -> list[Category]:
    return list(
        Category.select()
        .where(Category.tenant == tenant_id)
        .order_by(Category.position, Category.created_at)
    )


def get_category(category_id: str) -> Category | None:
    return Category.get_or_none(Category.id == category_id)


def create_category(tenant_id: str, **attrs) -> Category | None:
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return None
    return Category.create(tenant=tenant, position=_next_position(tenant_id), **attrs)


def update_category(category_id: str, **updates) -> Category | None:
    """Update a category. Renaming cascades to products referencing it by name."""
    category = get_category(category_id)
    if not category:
        return None
    old_name = category.name
    for key, value in updates.items():
        setattr(category, key, value)
    category.save()
    if "name" in updates and category.name != old_name:
        Product.update(category=category.name).where(
            (Product.tenant == category.tenant_id) & (Product.category == old_name)
        ).execute()
    return category


def delete_category(category_id: str) -> bool:
    """Delete a category and clear it from any products that referenced it."""
    category = get_category(category_id)
    if not category:
        return False
    Product.update(category=None).where(
        (Product.tenant == category.tenant_id) & (Product.category == category.name)
    ).execute()
    category.delete_instance()
    return True


def _next_position(tenant_id: str) -> int:
    last = (
        Category.select()
        .where(Category.tenant == tenant_id)
        .order_by(Category.position.desc())
        .first()
    )
    return (last.position + 1) if last else 0
