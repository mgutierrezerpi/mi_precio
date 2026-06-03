from fastapi import APIRouter, HTTPException, Depends
from lib.ctx import categories
from controllers.deps import get_current_user
from controllers.input_types import CreateCategory, UpdateCategory
from views import DeletedView, CategoryView

router = APIRouter(tags=["categories"])


@router.get("/tenants/{tenant_id}/categories")
def list_categories_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return CategoryView.render_many(categories.list_categories(tenant_id))


@router.post("/tenants/{tenant_id}/categories", status_code=201)
def create_category_endpoint(tenant_id: str, data: CreateCategory, current_user: dict = Depends(get_current_user)):
    category = categories.create_category(tenant_id, **data.model_dump())
    if not category:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return CategoryView.render(category)


@router.patch("/categories/{category_id}")
def update_category_endpoint(category_id: str, data: UpdateCategory, current_user: dict = Depends(get_current_user)):
    category = categories.update_category(category_id, **data.model_dump(exclude_unset=True))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryView.render(category)


@router.delete("/categories/{category_id}")
def delete_category_endpoint(category_id: str, current_user: dict = Depends(get_current_user)):
    if not categories.delete_category(category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    return DeletedView()
