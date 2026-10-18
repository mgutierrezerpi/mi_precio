from fastapi import APIRouter, Depends, HTTPException

from controllers import ownership
from controllers.deps import get_current_user, require_editor
from controllers.input_types import CreateCategory, UpdateCategory
from lib.ctx import activity, categories
from views import CategoryView, DeletedView

router = APIRouter(tags=["categories"])


def _refuse(error: categories.CategoryError) -> HTTPException:
    status = 409 if isinstance(error, categories.DuplicateCategoryName) else 400
    return HTTPException(status_code=status, detail=str(error))


@router.get("/tenants/{tenant_id}/categories")
def list_categories_endpoint(
    tenant_id: str, current_user: dict = Depends(get_current_user)
):
    return CategoryView.render_many(categories.list_categories(tenant_id))


@router.post("/tenants/{tenant_id}/categories", status_code=201)
def create_category_endpoint(
    tenant_id: str, data: CreateCategory, current_user: dict = Depends(require_editor)
):
    try:
        category = categories.create_category(tenant_id, **data.model_dump())
    except categories.CategoryError as error:
        raise _refuse(error) from error
    if not category:
        raise HTTPException(status_code=404, detail="Tenant not found")
    _record(category, "category.created", "Creó la categoría", current_user)
    return CategoryView.render(category)


@router.patch("/categories/{category_id}")
def update_category_endpoint(
    category_id: str, data: UpdateCategory, current_user: dict = Depends(require_editor)
):
    old_name = ownership.own_category(category_id, current_user).name
    try:
        category = categories.update_category(
            category_id, **data.model_dump(exclude_unset=True)
        )
    except categories.CategoryError as error:
        raise _refuse(error) from error
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.name != old_name:
        _record(
            category,
            "category.renamed",
            f"Renombró la categoría «{old_name}» a",
            current_user,
            old_name=old_name,
        )
    return CategoryView.render(category)


@router.delete("/categories/{category_id}")
def delete_category_endpoint(
    category_id: str, current_user: dict = Depends(require_editor)
):
    category = ownership.own_category(category_id, current_user)
    if not categories.delete_category(category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    _record(category, "category.deleted", "Eliminó la categoría", current_user)
    return DeletedView()


def _record(category, action: str, verb: str, current_user: dict, **meta) -> None:
    activity.record(
        category.tenant_id,
        action,
        f"{verb} «{category.name}»",
        actor=current_user.get("email"),
        actor_id=current_user.get("sub"),
        entity_type="category",
        entity_id=category.id,
        meta={"name": category.name, **meta},
    )
