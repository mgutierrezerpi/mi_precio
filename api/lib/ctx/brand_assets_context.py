"""Storage-backed image assets used for tenant and Linktree branding."""

from io import BytesIO
from uuid import uuid4

from infra.storage import ObjectStorageError, object_storage
from models import Tenant


SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_BRAND_IMAGE_BYTES = 5 * 1024 * 1024
BRAND_IMAGE_MAX_SIDE = 1200
MAX_LIST_VIDEO_BYTES = 50 * 1024 * 1024


class BrandImageUploadError(Exception):
    pass


def upload_brand_image(tenant_id: str, data: bytes, content_type: str) -> str | None:
    """Validate and optimize a brand image, then return its public storage URL."""
    if content_type not in SUPPORTED_IMAGE_TYPES:
        raise BrandImageUploadError("Unsupported image type")
    if len(data) > MAX_BRAND_IMAGE_BYTES:
        raise BrandImageUploadError("Image is too large")
    if not Tenant.get_or_none(Tenant.id == tenant_id):
        return None

    try:
        from PIL import Image, ImageOps

        image = ImageOps.exif_transpose(Image.open(BytesIO(data)))
        image.load()
        image.thumbnail((BRAND_IMAGE_MAX_SIDE, BRAND_IMAGE_MAX_SIDE))
        if image.mode == "P":
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        elif image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        encoded = BytesIO()
        image.save(encoded, format="WEBP", quality=88, method=6)
        key = f"tenants/{tenant_id}/brand/{uuid4().hex}.webp"
        return object_storage.upload(key, encoded.getvalue(), "image/webp")
    except ObjectStorageError as e:
        raise BrandImageUploadError(str(e)) from e
    except Exception as e:
        raise BrandImageUploadError("Invalid image data") from e


def upload_list_template_image(tenant_id: str, data: bytes, content_type: str) -> str | None:
    """Upload an editorial image for a public list template."""
    if content_type not in SUPPORTED_IMAGE_TYPES:
        raise BrandImageUploadError("Unsupported image type")
    if len(data) > MAX_BRAND_IMAGE_BYTES:
        raise BrandImageUploadError("Image is too large")
    if not Tenant.get_or_none(Tenant.id == tenant_id):
        return None
    try:
        from PIL import Image, ImageOps

        image = ImageOps.exif_transpose(Image.open(BytesIO(data)))
        image.load()
        image.thumbnail((BRAND_IMAGE_MAX_SIDE, BRAND_IMAGE_MAX_SIDE))
        if image.mode == "P":
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        elif image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        encoded = BytesIO()
        image.save(encoded, format="WEBP", quality=88, method=6)
        key = f"tenants/{tenant_id}/list-templates/{uuid4().hex}.webp"
        return object_storage.upload(key, encoded.getvalue(), "image/webp")
    except ObjectStorageError as e:
        raise BrandImageUploadError(str(e)) from e
    except Exception as e:
        raise BrandImageUploadError("Invalid image data") from e


def upload_list_template_video(tenant_id: str, data: bytes, content_type: str) -> str | None:
    """Upload an MP4 story clip without transcoding it."""
    if content_type != "video/mp4":
        raise BrandImageUploadError("Unsupported video type")
    if len(data) > MAX_LIST_VIDEO_BYTES:
        raise BrandImageUploadError("Video is too large")
    if not Tenant.get_or_none(Tenant.id == tenant_id):
        return None
    try:
        key = f"tenants/{tenant_id}/list-stories/{uuid4().hex}.mp4"
        return object_storage.upload(key, data, "video/mp4")
    except ObjectStorageError as e:
        raise BrandImageUploadError(str(e)) from e
