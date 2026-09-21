"""Product-image validation, conversion, and object-storage operations."""

from io import BytesIO
from typing import TypedDict
from uuid import uuid4

from infra.storage import ObjectStorageError, object_storage
from models import Tenant

PRODUCT_IMAGE_MAX_SIDE = 1600
PRODUCT_THUMB_MAX_SIDE = 320
WEBP_QUALITY = 82
WEBP_THUMB_QUALITY = 76


class ProductImageUpload(TypedDict):
    url: str
    thumbnail_url: str


class ProductImageUploadError(Exception):
    """Raised when a product image cannot be prepared or stored."""


def upload_product_image(
    tenant_id: str, content_type: str, data: bytes, storage=object_storage
) -> ProductImageUpload | None:
    """Store a WebP product image and thumbnail, returning their public URLs."""
    del content_type  # The decoded payload, not this client hint, is authoritative.
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
        image_url = storage.upload(f"{key_base}.webp", image_webp, "image/webp")
        thumb_url = storage.upload(
            f"{key_base}_thumb.webp", thumb_webp, "image/webp"
        )
    except ObjectStorageError as e:
        raise ProductImageUploadError(str(e)) from e
    return {"url": image_url, "thumbnail_url": thumb_url}


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
