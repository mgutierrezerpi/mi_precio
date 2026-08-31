from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from controllers.deps import get_current_user, require_editor
from controllers.input_types import UpdateLinkTree
from lib.ctx import activity, brand_assets, linktrees
from views import LinkTreeView


router = APIRouter(tags=["linktrees"])


@router.post("/tenants/{tenant_id}/list-template/image", status_code=201)
async def upload_list_template_image_endpoint(
    tenant_id: str,
    image: UploadFile = File(...),
    current_user: dict = Depends(require_editor),
):
    if current_user.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=403, detail="No tenés permisos para esta acción")
    try:
        url = brand_assets.upload_list_template_image(
            tenant_id, await image.read(), image.content_type or ""
        )
    except brand_assets.BrandImageUploadError as e:
        status = 413 if str(e) == "Image is too large" else 415 if str(e) == "Unsupported image type" else 503
        raise HTTPException(status_code=status, detail=str(e)) from e
    if not url:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"url": url}


@router.post("/tenants/{tenant_id}/linktree/avatar", status_code=201)
async def upload_linktree_avatar_endpoint(
    tenant_id: str,
    image: UploadFile = File(...),
    current_user: dict = Depends(require_editor),
):
    try:
        url = brand_assets.upload_brand_image(
            tenant_id, await image.read(), image.content_type or ""
        )
    except brand_assets.BrandImageUploadError as e:
        status = 413 if str(e) == "Image is too large" else 415 if str(e) == "Unsupported image type" else 503
        raise HTTPException(status_code=status, detail=str(e)) from e
    if not url:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"url": url}


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
    tree = linktrees.LinkTree.get_or_none(linktrees.LinkTree.public_slug == subdomain.lower())
    tenant = tree.tenant if tree else None
    if not tenant or not tree or not tree.published:
        raise HTTPException(status_code=404, detail="Linktree not found")
    return {"tenant": {"name": tenant.name, "subdomain": tenant.subdomain}, "linktree": LinkTreeView.render(tree)}
