from fastapi import APIRouter, HTTPException, Depends
from lib.ctx import lists, activity
from controllers.deps import get_current_user
from controllers.input_types import CreateList, UpdateList
from views import DeletedView, PriceListView

router = APIRouter(tags=["lists"])


@router.get("/tenants/{tenant_id}/lists")
def list_lists_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return PriceListView.render_many(lists.list_lists(tenant_id))


@router.post("/tenants/{tenant_id}/lists", status_code=201)
def create_list_endpoint(tenant_id: str, data: CreateList, current_user: dict = Depends(get_current_user)):
    result = lists.create_list(tenant_id, data.name)
    if not result:
        raise HTTPException(status_code=404, detail="Tenant not found")
    activity.record(tenant_id, "list.created", f"Creó la lista «{result.price_list.name}»",
                    actor=current_user.get("email"), actor_id=current_user.get("sub"),
                    entity_type="list", entity_id=result.price_list.id)
    return PriceListView.render(result.price_list, include_versions=True)


@router.get("/lists/{list_id}")
def get_list_endpoint(list_id: str, current_user: dict = Depends(get_current_user)):
    price_list = lists.get_list(list_id)
    if not price_list:
        raise HTTPException(status_code=404, detail="List not found")
    return PriceListView.render(price_list, include_versions=True)


@router.patch("/lists/{list_id}")
def update_list_endpoint(list_id: str, data: UpdateList, current_user: dict = Depends(get_current_user)):
    price_list = lists.update_list(list_id, **data.model_dump(exclude_unset=True))
    if not price_list:
        raise HTTPException(status_code=404, detail="List not found")
    if data.published is True:
        activity.record(price_list.tenant_id, "list.published", f"Publicó la lista «{price_list.name}»",
                        actor=current_user.get("email"), actor_id=current_user.get("sub"),
                        entity_type="list", entity_id=price_list.id)
    return PriceListView.render(price_list)


@router.delete("/lists/{list_id}")
def delete_list_endpoint(list_id: str, current_user: dict = Depends(get_current_user)):
    if not lists.delete_list(list_id):
        raise HTTPException(status_code=404, detail="List not found")
    return DeletedView()
