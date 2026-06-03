from fastapi import APIRouter, HTTPException, Depends
from lib.ctx import products
from controllers.deps import get_current_user
from controllers.input_types import CreateProduct, UpdateProduct
from views import DeletedView, ProductView

router = APIRouter(tags=["products"])


@router.get("/tenants/{tenant_id}/products")
def list_products_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return ProductView.render_many(products.list_products(tenant_id))


@router.post("/tenants/{tenant_id}/products", status_code=201)
def create_product_endpoint(tenant_id: str, data: CreateProduct, current_user: dict = Depends(get_current_user)):
    product = products.create_product(tenant_id, **data.model_dump())
    if not product:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return ProductView.render(product)


@router.get("/products/{product_id}")
def get_product_endpoint(product_id: str, current_user: dict = Depends(get_current_user)):
    product = products.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductView.render(product)


@router.patch("/products/{product_id}")
def update_product_endpoint(product_id: str, data: UpdateProduct, current_user: dict = Depends(get_current_user)):
    product = products.update_product(product_id, **data.model_dump(exclude_unset=True))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductView.render(product)


@router.delete("/products/{product_id}")
def delete_product_endpoint(product_id: str, current_user: dict = Depends(get_current_user)):
    if not products.delete_product(product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    return DeletedView()
