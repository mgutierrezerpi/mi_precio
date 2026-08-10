"""Items context - item operations."""

from models import Item, ListVersion, Product


def list_items(version_id: str) -> list[Item]:
    """Get all items for a version, ordered by position."""
    return list(
        Item.select().where(Item.list_version == version_id).order_by(Item.position)
    )


def get_item(item_id: str) -> Item | None:
    """Get an item by ID."""
    return Item.get_or_none(Item.id == item_id)


def create_item(version_id: str, **attrs) -> Item | None:
    """Create a list association for a tenant-global product.

    Legacy callers may omit ``product_id``; in that case the product is looked
    up or created from the item name so no new orphan catalog rows are created.
    The list price remains a per-list snapshot, while product metadata is global.
    """
    version = ListVersion.get_or_none(ListVersion.id == version_id)
    if not version:
        return None
    product_id = attrs.pop("product_id", None)
    tenant_id = version.list.tenant_id
    if product_id:
        product = Product.get_or_none(
            (Product.id == product_id) & (Product.tenant == tenant_id)
        )
        if not product:
            return None
    else:
        name = str(attrs.get("name", "")).strip()
        if not name:
            return None
        product = _find_product(tenant_id, name)
        if not product:
            product = Product.create(
                tenant=version.list.tenant,
                name=name,
                price=attrs.get("price", 0),
                currency=attrs.get("currency", "UYU"),
                description=attrs.get("description"),
                image_url=attrs.get("image_url"),
                image_thumb_url=attrs.get("image_thumb_url"),
                category=attrs.get("category"),
                position=_next_product_position(tenant_id),
            )
    attrs.update(
        product=product,
        name=product.name,
        currency=product.currency,
        description=product.description,
        image_url=product.image_url,
        image_thumb_url=product.image_thumb_url,
        category=product.category,
    )
    return Item.create(
        list_version=version,
        position=_next_position(version_id),
        **attrs,
    )


def update_item(item_id: str, **updates) -> Item | None:
    """Update an item's properties."""
    item = get_item(item_id)
    if not item:
        return None
    product = item.product
    if product:
        profile_fields = {
            "name",
            "description",
            "category",
            "currency",
            "image_url",
            "image_thumb_url",
        }
        profile_updates = {key: value for key, value in updates.items() if key in profile_fields}
        for key, value in profile_updates.items():
            setattr(product, key, value)
        if profile_updates:
            product.save()
            item.name = product.name
            item.description = product.description
            item.category = product.category
            item.currency = product.currency
            item.image_url = product.image_url
            item.image_thumb_url = product.image_thumb_url
            Item.update(
                name=product.name,
                description=product.description,
                category=product.category,
                currency=product.currency,
                image_url=product.image_url,
                image_thumb_url=product.image_thumb_url,
            ).where(Item.product == product.id).execute()
        updates = {key: value for key, value in updates.items() if key not in profile_fields}
    for key, value in updates.items():
        if value is not None:
            setattr(item, key, value)
    item.save()
    return item


def delete_item(item_id: str) -> bool:
    """Delete an item."""
    item = get_item(item_id)
    if not item:
        return False
    item.delete_instance()
    return True


def reorder_items(version_id: str, item_ids: list[str]) -> bool:
    """Reorder items by updating their positions."""
    for position, item_id in enumerate(item_ids):
        Item.update(position=position).where(
            (Item.id == item_id) & (Item.list_version == version_id)
        ).execute()
    return True


def _next_position(version_id: str) -> int:
    """Get the next position for a new item."""
    last = (
        Item.select()
        .where(Item.list_version == version_id)
        .order_by(Item.position.desc())
        .first()
    )
    return (last.position + 1) if last else 0


def _find_product(tenant_id: str, name: str) -> Product | None:
    normalized = name.strip().casefold()
    for product in Product.select().where(Product.tenant == tenant_id):
        if product.name.strip().casefold() == normalized:
            return product
    return None


def _next_product_position(tenant_id: str) -> int:
    last = (
        Product.select()
        .where(Product.tenant == tenant_id)
        .order_by(Product.position.desc())
        .first()
    )
    return (last.position + 1) if last else 0
