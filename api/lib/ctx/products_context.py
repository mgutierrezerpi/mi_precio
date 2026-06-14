"""Products context - tenant-level product catalog operations."""

from pathlib import Path
from uuid import uuid4

from infra.storage import object_storage
from infra.storage import ObjectStorageError
from models import Tenant, Product, PriceList, ListVersion, Item


SUPPORTED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


class ProductImageUploadError(Exception):
    pass


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
    original_name = product.name
    price_list_ids = updates.pop("price_list_ids", None)
    for key, value in updates.items():
        setattr(product, key, value)
    product.save()
    if "price" in updates:
        _sync_item_prices(product.tenant_id, original_name, product.price, price_list_ids)
    return product


def delete_product(product_id: str) -> bool:
    """Delete a product."""
    product = get_product(product_id)
    if not product:
        return False
    product.delete_instance()
    return True


def upload_product_image(tenant_id: str, filename: str, content_type: str, data: bytes) -> str | None:
    """Store a product image and return its public URL."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return None

    extension = _image_extension(filename, content_type)
    key = f"tenants/{tenant_id}/product_images/{uuid4().hex}{extension}"
    try:
        return object_storage.upload(key, data, content_type)
    except ObjectStorageError as e:
        raise ProductImageUploadError(str(e)) from e


def _next_position(tenant_id: str) -> int:
    """Get the next position for a new product."""
    last = (
        Product.select()
        .where(Product.tenant == tenant_id)
        .order_by(Product.position.desc())
        .first()
    )
    return (last.position + 1) if last else 0


def _sync_item_prices(tenant_id: str, product_name: str, price, price_list_ids: list[str] | None) -> None:
    version_ids = (
        ListVersion.select(ListVersion.id)
        .join(PriceList)
        .where(PriceList.tenant == tenant_id)
    )
    if price_list_ids is not None:
        version_ids = version_ids.where(PriceList.id.in_(price_list_ids))
    Item.update(price=price).where(
        (Item.list_version.in_(version_ids)) & (Item.name == product_name)
    ).execute()


def _image_extension(filename: str, content_type: str) -> str:
    extension = SUPPORTED_IMAGE_TYPES.get(content_type)
    if extension:
        return extension

    suffix = Path(filename).suffix.lower()
    if suffix in SUPPORTED_IMAGE_TYPES.values():
        return suffix

    return ".jpg"
