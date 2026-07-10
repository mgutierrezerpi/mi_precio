from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from lib.ctx import products, activity, plans
from lib.ctx.plans_context import PlanLimitError
from controllers import ownership
from controllers.deps import get_current_user, require_editor
from controllers.input_types import CreateProduct, UpdateProduct
from views import DeletedView, ProductImageView, ProductView

router = APIRouter(tags=["products"])

MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024
SUPPORTED_PRODUCT_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.get("/tenants/{tenant_id}/products")
def list_products_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return ProductView.render_many(products.list_products(tenant_id))


@router.post("/tenants/{tenant_id}/products", status_code=201)
def create_product_endpoint(tenant_id: str, data: CreateProduct, current_user: dict = Depends(require_editor)):
    try:
        plans.assert_can_add(tenant_id, "products")
    except PlanLimitError as e:
        raise HTTPException(status_code=402, detail=str(e))
    product = products.create_product(tenant_id, **data.model_dump())
    if not product:
        raise HTTPException(status_code=404, detail="Tenant not found")
    activity.record(tenant_id, "product.created", f"Agregó el producto «{product.name}»",
                    actor=current_user.get("email"), actor_id=current_user.get("sub"),
                    entity_type="product", entity_id=product.id, meta={"name": product.name})
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
def get_product_endpoint(product_id: str, current_user: dict = Depends(get_current_user)):
    product = ownership.own_product(product_id, current_user)
    return ProductView.render(product)


@router.patch("/products/{product_id}")
def update_product_endpoint(product_id: str, data: UpdateProduct, current_user: dict = Depends(require_editor)):
    ownership.own_product(product_id, current_user)
    product = products.update_product(product_id, **data.model_dump(exclude_unset=True))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductView.render(product)


@router.delete("/products/{product_id}")
def delete_product_endpoint(product_id: str, current_user: dict = Depends(require_editor)):
    product = ownership.own_product(product_id, current_user)
    name, tenant_id = product.name, product.tenant_id
    products.delete_product(product_id)
    activity.record(tenant_id, "product.deleted", f"Eliminó el producto «{name}»",
                    actor=current_user.get("email"), actor_id=current_user.get("sub"),
                    entity_type="product", entity_id=product_id, meta={"name": name})
    return DeletedView()
