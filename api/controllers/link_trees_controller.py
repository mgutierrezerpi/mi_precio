from fastapi import APIRouter, Depends, HTTPException

from controllers.deps import get_current_user, require_editor
from controllers.input_types import UpdateLinkTree
from lib.ctx import activity, linktrees
from views import LinkTreeView


router = APIRouter(tags=["linktrees"])


@router.get("/tenants/{tenant_id}/linktree")
def get_linktree_endpoint(
    tenant_id: str, current_user: dict = Depends(get_current_user)
):
    tree = linktrees.get_linktree(tenant_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Business not found")
    return LinkTreeView.render(tree)


@router.patch("/tenants/{tenant_id}/linktree")
def update_linktree_endpoint(
    tenant_id: str,
    data: UpdateLinkTree,
    current_user: dict = Depends(require_editor),
):
    tree = linktrees.get_linktree(tenant_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Business not found")
    tree = linktrees.update_linktree(
        tree.id, **data.model_dump(exclude_unset=True)
    )
    activity.record(
        tenant_id,
        "linktree.updated",
        "Actualizó su Linktree",
        actor=current_user.get("email"),
        actor_id=current_user.get("sub"),
        entity_type="linktree",
        entity_id=tree.id if tree else None,
    )
    return LinkTreeView.render(tree)


@router.get("/public/{subdomain}/linktree")
def get_public_linktree_endpoint(subdomain: str):
    from lib.ctx.public_context import get_tenant_by_subdomain

    tenant = get_tenant_by_subdomain(subdomain)
    tree = linktrees.get_linktree(str(tenant.id), create=False) if tenant else None
    if not tenant or not tree or not tree.published:
        raise HTTPException(status_code=404, detail="Linktree not found")
    return {"tenant": {"name": tenant.name, "subdomain": tenant.subdomain}, "linktree": LinkTreeView.render(tree)}
