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
    """Create or update the tenant-global product with this name.

    Product names are the human-facing identity used by imports and older list
    data, so creating the same product twice should not create two catalogs.
    """
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return None
    existing = find_product_by_name(tenant_id, attrs.get("name"))
    if existing:
        return update_product(existing.id, **attrs)
    return Product.create(
        tenant=tenant,
        position=_next_position(tenant_id),
        **attrs,
    )


def find_product_by_name(tenant_id: str, name: str | None) -> Product | None:
    """Find a tenant product by its normalized, case-insensitive name."""
    normalized = _norm_name(name)
    if not normalized:
        return None
    for product in Product.select().where(Product.tenant == tenant_id):
        if _norm_name(product.name) == normalized:
            return product
    return None


def backfill_orphan_items() -> int:
    """Attach legacy list items to tenant-global products.

    Older imports created list snapshots without a product link. Reusing the
    first product with the same name keeps those snapshots visible while making
    the catalog complete for the Products screen. Rows whose old list relation
    is already broken are skipped so a corrupt legacy snapshot cannot prevent
    the API from starting.
    """
    linked = 0
    tenant_field = PriceList.tenant_id.alias("tenant_id")
    version_tenants = {
        row["id"]: row["tenant_id"]
        for row in ListVersion.select(ListVersion.id, tenant_field)
        .join(PriceList)
        .dicts()
    }
    for item in Item.select().where(Item.product.is_null()):
        tenant_id = version_tenants.get(item.list_version_id)
        if not tenant_id:
            continue
        product = find_product_by_name(tenant_id, item.name)
        if not product:
            tenant = Tenant.get_by_id(tenant_id)
            product = Product.create(
                tenant=tenant,
                name=item.name,
                price=item.price,
                currency=item.currency,
                description=item.description,
                image_url=item.image_url,
                image_thumb_url=item.image_thumb_url,
                category=item.category,
                position=_next_position(tenant_id),
            )
        item.product = product
        item.save()
        linked += 1
    return linked


def update_product(product_id: str, **updates) -> Product | None:
    """Update a product's properties.

    `updates` only contains fields the client explicitly sent (the controller
    uses `exclude_unset`), so every one is applied — including `None`/empty,
    which lets the client clear optional fields (sku, category, description…).
    """
    product = get_product(product_id)
    if not product:
        return None
    price_list_ids = updates.pop("price_list_ids", None)
    for key, value in updates.items():
        setattr(product, key, value)
    product.save()
    if "price" in updates:
        _sync_item_prices(product.tenant_id, product.id, product.price, price_list_ids)
    if any(field in updates for field in ("name", "description", "category", "currency")):
        _sync_item_profile(product.id, product)
    if "image_url" in updates or "image_thumb_url" in updates:
        _sync_item_images(product.id, product.image_url, product.image_thumb_url)
    return product


def delete_product(product_id: str) -> bool:
    """Delete a product."""
    product = get_product(product_id)
    if not product:
        return False
    Item.delete().where(Item.product == product.id).execute()
    product.delete_instance()
    return True


def upload_product_image(
    tenant_id: str, content_type: str, data: bytes
) -> ProductImageUpload | None:
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
        thumb_url = object_storage.upload(
            f"{key_base}_thumb.webp", thumb_webp, "image/webp"
        )
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


def _sync_item_prices(
    tenant_id: str, product_id: str, price, price_list_ids: list[str] | None
) -> None:
    version_ids = (
        ListVersion.select(ListVersion.id)
        .join(PriceList)
        .where(PriceList.tenant == tenant_id)
    )
    if price_list_ids is not None:
        version_ids = version_ids.where(PriceList.id.in_(price_list_ids))
    Item.update(price=price).where(
        (Item.list_version.in_(version_ids)) & (Item.product == product_id)
    ).execute()


def _sync_item_profile(product_id: str, product: Product) -> None:
    """Keep all list snapshots aligned with global product metadata."""
    Item.update(
        name=product.name,
        description=product.description,
        category=product.category,
        currency=product.currency,
    ).where(Item.product == product_id).execute()


def _sync_item_images(
    product_id: str, image_url: str | None, image_thumb_url: str | None
) -> None:
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

    if image.mode in ("RGBA", "LA") or (
        image.mode == "P" and "transparency" in image.info
    ):
        background = image.convert("RGBA")
        flattened = Image.new("RGBA", background.size, (255, 255, 255, 255))
        flattened.alpha_composite(background)
        image = flattened.convert("RGB")
    elif image.mode != "RGB":
        image = image.convert("RGB")

    output = BytesIO()
    image.save(output, format="WEBP", quality=quality, method=6)
    return output.getvalue()


def _norm_name(name: str | None) -> str:
    return (name or "").strip().casefold()
