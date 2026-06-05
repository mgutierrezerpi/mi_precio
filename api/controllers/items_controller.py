from fastapi import APIRouter, HTTPException, Depends
from lib.ctx import items
from controllers.deps import get_current_user, require_editor
from controllers.input_types import CreateItem, UpdateItem, ReorderItems
from views import DeletedView, ReorderedView, ItemView

router = APIRouter(tags=["items"])


@router.get("/versions/{version_id}/items")
def list_items_endpoint(version_id: str, current_user: dict = Depends(get_current_user)):
    return ItemView.render_many(items.list_items(version_id))


@router.post("/versions/{version_id}/items", status_code=201)
def create_item_endpoint(version_id: str, data: CreateItem, current_user: dict = Depends(require_editor)):
    item = items.create_item(version_id, **data.model_dump())
    if not item:
        raise HTTPException(status_code=404, detail="Version not found")
    return ItemView.render(item)


@router.get("/items/{item_id}")
def get_item_endpoint(item_id: str, current_user: dict = Depends(get_current_user)):
    item = items.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemView.render(item)


@router.patch("/items/{item_id}")
def update_item_endpoint(item_id: str, data: UpdateItem, current_user: dict = Depends(require_editor)):
    item = items.update_item(item_id, **data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemView.render(item)


@router.delete("/items/{item_id}")
def delete_item_endpoint(item_id: str, current_user: dict = Depends(require_editor)):
    if not items.delete_item(item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    return DeletedView()


@router.put("/versions/{version_id}/items/order")
def reorder_items_endpoint(version_id: str, data: ReorderItems, current_user: dict = Depends(require_editor)):
    items.reorder_items(version_id, data.item_ids)
    return ReorderedView()
