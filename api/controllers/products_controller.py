from decimal import Decimal

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from controllers import ownership
from controllers.deps import get_current_user, require_editor
from controllers.input_types import CreateProduct, UpdateProduct
from lib.ctx import activity, plans, products
from lib.ctx.plans_context import PlanLimitError
from views import DeletedView, ProductImageView, ProductView

router = APIRouter(tags=["products"])

MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024
SUPPORTED_PRODUCT_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.get("/tenants/{tenant_id}/products")
def list_products_endpoint(
    tenant_id: str, current_user: dict = Depends(get_current_user)
):
    return ProductView.render_many(products.list_products(tenant_id))


@router.post("/tenants/{tenant_id}/products", status_code=201)
def create_product_endpoint(
    tenant_id: str, data: CreateProduct, current_user: dict = Depends(require_editor)
):
    try:
        plans.assert_can_add(tenant_id, "products")
    except PlanLimitError as e:
        raise HTTPException(status_code=402, detail=str(e))
    product = products.create_product(tenant_id, **data.model_dump())
    if not product:
        raise HTTPException(status_code=404, detail="Tenant not found")
    activity.record(
        tenant_id,
        "product.created",
        f"Agregó el producto «{product.name}»",
        actor=current_user.get("email"),
        actor_id=current_user.get("sub"),
        entity_type="product",
        entity_id=product.id,
        meta={"name": product.name},
    )
    return ProductView.render(product)


@router.post("/tenants/{tenant_id}/product_images", status_code=201)
async def create_product_image_endpoint(
    tenant_id: str,
    image: UploadFile = File(...),
    current_user: dict = Depends(require_editor),
):
    content_type = image.content_type or ""
    if content_type not in SUPPORTED_PRODUCT_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported image type")

    data = await image.read()
    if len(data) > MAX_PRODUCT_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image is too large")

    try:
        uploaded = products.upload_product_image(tenant_id, content_type, data)
    except products.ProductImageUploadError as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not uploaded:
        raise HTTPException(status_code=404, detail="Tenant not found")

    return ProductImageView.render(uploaded)


@router.get("/products/{product_id}")
def get_product_endpoint(
    product_id: str, current_user: dict = Depends(get_current_user)
):
    product = ownership.own_product(product_id, current_user)
    return ProductView.render(product)


@router.patch("/products/{product_id}")
def update_product_endpoint(
    product_id: str, data: UpdateProduct, current_user: dict = Depends(require_editor)
):
    before = ownership.own_product(product_id, current_user)
    old_price, old_name = before.price, before.name
    changes = data.model_dump(exclude_unset=True)
    product = products.update_product(product_id, **changes)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    _record_product_update(product, changes, old_price, old_name, current_user)
    return ProductView.render(product)


def _amount(value) -> str:
    """190.00 → «190», 190.50 → «190.5»: how the CRM writes prices."""
    return format(Decimal(str(value)).normalize(), "f")


def _record_product_update(product, changes, old_price, old_name, current_user):
    """A price change is the edit shops most want to trace, so it gets its own
    entry with both amounts; anything else is a plain «edited»."""
    price_changed = "price" in changes and Decimal(str(product.price)) != Decimal(
        str(old_price)
    )
    if price_changed:
        action, summary = (
            "product.price_changed",
            f"Cambió el precio de «{product.name}» de {product.currency} "
            f"{_amount(old_price)} a {product.currency} {_amount(product.price)}",
        )
        meta = {
            "name": product.name,
            "currency": product.currency,
            "old": _amount(old_price),
            "new": _amount(product.price),
        }
    elif set(changes) - {"price", "price_list_ids"}:
        action, summary = "product.updated", f"Editó el producto «{product.name}»"
        meta = {"name": product.name, "old_name": old_name}
    else:
        return
    activity.record(
        product.tenant_id,
        action,
        summary,
        actor=current_user.get("email"),
        actor_id=current_user.get("sub"),
        entity_type="product",
        entity_id=product.id,
        meta=meta,
        coalesce_minutes=None if price_changed else 10,
    )


@router.delete("/products/{product_id}")
def delete_product_endpoint(
    product_id: str, current_user: dict = Depends(require_editor)
):
    product = ownership.own_product(product_id, current_user)
    name, tenant_id = product.name, product.tenant_id
    products.delete_product(product_id)
    activity.record(
        tenant_id,
        "product.deleted",
        f"Eliminó el producto «{name}»",
        actor=current_user.get("email"),
        actor_id=current_user.get("sub"),
        entity_type="product",
        entity_id=product_id,
        meta={"name": name},
    )
    return DeletedView()
