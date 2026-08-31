from fastapi import APIRouter, Depends, HTTPException

from controllers import ownership
from controllers.deps import get_current_user, require_editor
from controllers.input_types import CreateList, UpdateList
from lib.ctx import activity, lists, plans
from lib.ctx.plans_context import PlanLimitError
from views import DeletedView, PriceListView

router = APIRouter(tags=["lists"])


@router.get("/tenants/{tenant_id}/lists")
def list_lists_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return PriceListView.render_many(lists.list_lists(tenant_id))


@router.post("/tenants/{tenant_id}/lists", status_code=201)
def create_list_endpoint(
    tenant_id: str, data: CreateList, current_user: dict = Depends(require_editor)
):
    try:
        plans.assert_can_add(tenant_id, "lists")
    except PlanLimitError as e:
        raise HTTPException(status_code=402, detail=str(e))
    result = lists.create_list(
        tenant_id,
        data.name,
        data.kind,
        data.parent_list_id,
        data.variant_type,
        data.customer_id,
        data.starts_at,
        data.ends_at,
    )
    if not result:
        raise HTTPException(
            status_code=422,
            detail="Invalid variant parent, customer, or date range",
        )
    activity.record(
        tenant_id,
        "list.created",
        f"Creó {'la variante' if result.price_list.parent_list_id else 'la lista'} «{result.price_list.name}»",
        actor=current_user.get("email"),
        actor_id=current_user.get("sub"),
        entity_type="list",
        entity_id=result.price_list.id,
        meta={
            "name": result.price_list.name,
            "parent_list_id": result.price_list.parent_list_id,
            "variant_type": result.price_list.variant_type,
        },
    )
    return PriceListView.render(result.price_list, include_versions=True)


@router.get("/lists/{list_id}")
def get_list_endpoint(list_id: str, current_user: dict = Depends(get_current_user)):
    price_list = ownership.own_list(list_id, current_user)
    return PriceListView.render(price_list, include_versions=True)


@router.patch("/lists/{list_id}")
def update_list_endpoint(
    list_id: str, data: UpdateList, current_user: dict = Depends(require_editor)
):
    ownership.own_list(list_id, current_user)
    price_list = lists.update_list(list_id, **data.model_dump(exclude_unset=True))
    if not price_list:
        raise HTTPException(status_code=404, detail="List not found")
    if data.published is True:
        activity.record(
            price_list.tenant_id,
            "list.published",
            f"Publicó la lista «{price_list.name}»",
            actor=current_user.get("email"),
            actor_id=current_user.get("sub"),
            entity_type="list",
            entity_id=price_list.id,
            meta={"name": price_list.name},
        )
    return PriceListView.render(price_list)


@router.delete("/lists/{list_id}")
def delete_list_endpoint(list_id: str, current_user: dict = Depends(require_editor)):
    ownership.own_list(list_id, current_user)
    if not lists.delete_list(list_id):
        raise HTTPException(status_code=404, detail="List not found")
    return DeletedView()
