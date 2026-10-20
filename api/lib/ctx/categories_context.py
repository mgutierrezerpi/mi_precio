"""Categories context - tenant-level category operations (with product cascade)."""

from peewee import fn

from models import Category, Product, Tenant


class CategoryError(Exception):
    """A category change the shop has to fix before it can be saved."""


class DuplicateCategoryName(CategoryError):
    """Another category of the same shop already uses that name."""


def _clean_name(name: str | None) -> str:
    name = (name or "").strip()
    if not name:
        raise CategoryError("El nombre no puede estar vacío")
    return name


def _name_taken(tenant_id: str, name: str, exclude_id: str | None = None) -> bool:
    """Whether another category of the shop already uses `name`.

    Products point at categories by name (free text), so two categories with
    the same name — even differing only in casing — are the same category to
    the products and must not coexist. Compared in Python: SQLite's LOWER()
    only folds ASCII, so «CAFÉS» and «cafés» would slip through it."""
    key = name.casefold()
    return any(
        c.name.strip().casefold() == key and str(c.id) != str(exclude_id)
        for c in Category.select(Category.id, Category.name).where(
            Category.tenant == tenant_id
        )
    )


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
    attrs["name"] = _clean_name(attrs.get("name"))
    if _name_taken(tenant_id, attrs["name"]):
        raise DuplicateCategoryName("Ya existe una categoría con ese nombre")
    return Category.create(tenant=tenant, position=_next_position(tenant_id), **attrs)


def update_category(category_id: str, **updates) -> Category | None:
    """Update a category. Renaming cascades to products referencing it by name."""
    category = get_category(category_id)
    if not category:
        return None
    if "name" in updates:
        updates["name"] = _clean_name(updates["name"])
        if _name_taken(category.tenant_id, updates["name"], exclude_id=category.id):
            raise DuplicateCategoryName("Ya existe una categoría con ese nombre")
    old_name = category.name
    for key, value in updates.items():
        setattr(category, key, value)
    category.save()
    if "name" in updates and category.name != old_name:
        # Match products case-insensitively: their category is free text and may
        # differ only in casing from the category record (casing is preserved on
        # save, not canonicalized), so an exact match would miss them.
        Product.update(category=category.name).where(
            (Product.tenant == category.tenant_id)
            & (fn.LOWER(Product.category) == old_name.lower())
        ).execute()
    return category


def delete_category(category_id: str) -> bool:
    """Delete a category and clear it from any products that referenced it.

    Products reference categories by name, so if another category of the shop
    still carries the same name (a duplicate from before names were unique),
    those products belong to it too and keep their category."""
    category = get_category(category_id)
    if not category:
        return False
    if not _name_taken(category.tenant_id, category.name, exclude_id=category.id):
        # Case-insensitive match: product categories are free text and may
        # differ only in casing from the category record (see update_category).
        Product.update(category=None).where(
            (Product.tenant == category.tenant_id)
            & (fn.LOWER(Product.category) == category.name.lower())
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
