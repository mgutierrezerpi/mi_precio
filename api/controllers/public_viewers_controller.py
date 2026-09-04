"""Plan-gated CRM endpoints for identified public viewers."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from controllers.deps import get_current_user, require_editor
from lib.ctx import public_viewers
from views import CustomerView, PublicViewerView

router = APIRouter(tags=["public-viewers"])


@router.get("/tenants/{tenant_id}/public-viewers")
def list_public_viewers(
    tenant_id: str, current_user: Annotated[dict, Depends(get_current_user)]
):
    return PublicViewerView.render_many(public_viewers.list_viewers(tenant_id))


@router.get("/tenants/{tenant_id}/public-viewers/stats")
def public_viewer_stats(
    tenant_id: str, current_user: Annotated[dict, Depends(get_current_user)]
):
    return {"anonymous_dismissals": public_viewers.anonymous_dismissal_count(tenant_id)}


@router.post("/tenants/{tenant_id}/public-viewers/{viewer_id}/promote")
def promote_public_viewer(
    tenant_id: str,
    viewer_id: str,
    current_user: Annotated[dict, Depends(require_editor)],
):
    customer = public_viewers.promote_viewer(tenant_id, viewer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Viewer not found")
    return CustomerView.render(customer)


@router.delete("/tenants/{tenant_id}/public-viewers/{viewer_id}")
def delete_public_viewer(
    tenant_id: str,
    viewer_id: str,
    current_user: Annotated[dict, Depends(require_editor)],
):
    if not public_viewers.delete_viewer(tenant_id, viewer_id):
        raise HTTPException(status_code=404, detail="Viewer not found")
    return {"deleted": True}
