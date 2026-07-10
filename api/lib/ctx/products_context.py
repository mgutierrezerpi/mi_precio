"""Products context - tenant-level product catalog operations."""

from io import BytesIO
from typing import TypedDict
from uuid import uuid4

from infra.storage import object_storage
from infra.storage import ObjectStorageError
from models import Tenant, Product, PriceList, ListVersion, Item


SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
PRODUCT_IMAGE_MAX_SIDE = 1600
PRODUCT_THUMB_MAX_SIDE = 320
WEBP_QUALITY = 82
WEBP_THUMB_QUALITY = 76


class ProductImageUpload(TypedDict):
    url: str
    thumbnail_url: str


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
    if "image_url" in updates or "image_thumb_url" in updates:
        _sync_item_images(product.id, product.image_url, product.image_thumb_url)
    return product


def delete_product(product_id: str) -> bool:
    """Delete a product."""
    product = get_product(product_id)
    if not product:
        return False
    product.delete_instance()
    return True


def upload_product_image(tenant_id: str, content_type: str, data: bytes) -> ProductImageUpload | None:
    """Store a WebP product image and thumbnail, returning their public URLs."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return None

    try:
        image = _open_image(data)
        image_webp = _encode_webp(image, PRODUCT_IMAGE_MAX_SIDE, WEBP_QUALITY)
        thumb_webp = _encode_webp(image, PRODUCT_THUMB_MAX_SIDE, WEBP_THUMB_QUALITY)
    except Exception as e:
        raise ProductImageUploadError("Invalid image data") from e

    key_base = f"tenants/{tenant_id}/product_images/{uuid4().hex}"
    try:
        image_url = object_storage.upload(f"{key_base}.webp", image_webp, "image/webp")
        thumb_url = object_storage.upload(f"{key_base}_thumb.webp", thumb_webp, "image/webp")
    except ObjectStorageError as e:
        raise ProductImageUploadError(str(e)) from e

    return {"url": image_url, "thumbnail_url": thumb_url}


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


def _sync_item_images(product_id: str, image_url: str | None, image_thumb_url: str | None) -> None:
    Item.update(image_url=image_url, image_thumb_url=image_thumb_url).where(
        Item.product == product_id
    ).execute()


def _open_image(data: bytes):
    from PIL import Image, ImageOps

    image = Image.open(BytesIO(data))
    return ImageOps.exif_transpose(image)


def _encode_webp(image, max_side: int, quality: int) -> bytes:
    from PIL import Image

    image = image.copy()
    image.thumbnail((max_side, max_side))

    if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
        background = image.convert("RGBA")
        flattened = Image.new("RGBA", background.size, (255, 255, 255, 255))
        flattened.alpha_composite(background)
        image = flattened.convert("RGB")
    elif image.mode != "RGB":
        image = image.convert("RGB")

    output = BytesIO()
    image.save(output, format="WEBP", quality=quality, method=6)
    return output.getvalue()
