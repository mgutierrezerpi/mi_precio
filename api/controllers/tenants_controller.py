from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from config import settings
from controllers.deps import (
    get_current_user,
    require_active_plan,
    require_admin,
    require_owner,
)
from controllers.input_types import CreateTenant, UpdatePlan, UpdateTenant
from lib import encode_token
from lib.ctx import activity, brand_assets, identity, plans
from lib.value_objects import AuthResult
from models import User
from views import AuthTokenView, DeletedView, TenantView

router = APIRouter(prefix="/tenants", tags=["tenants"])

# CRM data on this router, closed while the tenant owes us a plan. Reading the
# tenant, reading/changing the plan and deleting the account stay open so a
# gated owner can still get out of the plan screen.
plan_gated = [Depends(require_active_plan)]


@router.get("/{tenant_id}/plan")
def plan_info_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return plans.plan_info(tenant_id)


@router.patch("/{tenant_id}/plan")
def update_plan_endpoint(
    tenant_id: str, data: UpdatePlan, current_user: dict = Depends(require_owner)
):
    if settings.billing_enabled and data.plan != "free":
        raise HTTPException(
            status_code=402, detail="Los planes pagos se activan desde facturación."
        )
    if current_user.get("tenant_id") != tenant_id:
        raise HTTPException(
            status_code=403, detail="No tenés permisos para esta acción"
        )
    try:
        tenant = plans.set_plan(tenant_id, data.plan)
    except ValueError:
        raise HTTPException(status_code=400, detail="Plan inválido")
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    activity.record(
        tenant_id,
        "plan.changed",
        f"Cambió el plan a {data.plan}",
        actor=current_user.get("email"),
        actor_id=current_user.get("sub"),
        entity_type="tenant",
        entity_id=tenant_id,
        meta={"plan": data.plan},
    )
    return TenantView.render(tenant)


@router.get("")
def list_tenants_endpoint(current_user: dict = Depends(get_current_user)):
    return TenantView.render_many(identity.list_tenants(current_user.get("sub")))


@router.post("", status_code=201)
def create_tenant_endpoint(
    data: CreateTenant, current_user: dict = Depends(get_current_user)
):
    tenant = identity.create_tenant(data.name, data.subdomain, current_user.get("sub"))
    if not tenant:
        raise HTTPException(
            status_code=400,
            detail="No se pudo crear el negocio. Revisá el nombre o subdominio.",
        )
    return TenantView.render(tenant)


@router.post("/{tenant_id}/switch")
def switch_tenant_endpoint(
    tenant_id: str, current_user: dict = Depends(get_current_user)
):
    member = identity.membership(current_user.get("sub"), tenant_id)
    tenant = identity.get_tenant(tenant_id)
    user = User.get_or_none(User.id == current_user.get("sub"))
    if not member or not tenant or not user:
        raise HTTPException(status_code=403, detail="No tenés acceso a este negocio")
    # A legacy free business may predate paid onboarding. Once its owner opens
    # it again, require a plan before CRM access instead of exposing a
    # subscription-less workspace.
    if plans.normalize_plan(tenant.plan) == "free" and not tenant.plan_gate:
        tenant.plan_gate = True
        tenant.save()
    token = encode_token(str(user.id), user.email, tenant.id, member.role)
    return AuthTokenView.render(AuthResult(token, user, tenant, member.role))


@router.get("/{tenant_id}")
def get_tenant_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    tenant = identity.get_tenant(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return TenantView.render(tenant)


@router.patch("/{tenant_id}", dependencies=plan_gated)
def update_tenant_endpoint(
    tenant_id: str, data: UpdateTenant, current_user: dict = Depends(require_admin)
):
    try:
        tenant = identity.update_tenant(
            tenant_id, **data.model_dump(exclude_unset=True)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return TenantView.render(tenant)


@router.post("/{tenant_id}/logo", status_code=201, dependencies=plan_gated)
async def upload_tenant_logo_endpoint(
    tenant_id: str,
    image: UploadFile = File(...),
    current_user: dict = Depends(require_admin),
):
    try:
        url = brand_assets.upload_brand_image(
            tenant_id, await image.read(), image.content_type or ""
        )
    except brand_assets.BrandImageUploadError as e:
        status = (
            413
            if str(e) == "Image is too large"
            else 415
            if str(e) == "Unsupported image type"
            else 503
        )
        raise HTTPException(status_code=status, detail=str(e)) from e
    if not url:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"url": url}


@router.delete("/{tenant_id}")
def delete_tenant_endpoint(tenant_id: str, current_user: dict = Depends(require_owner)):
    # An owner can only delete their own account.
    if current_user.get("tenant_id") != tenant_id:
        raise HTTPException(
            status_code=403, detail="No tenés permisos para esta acción"
        )
    if not identity.delete_tenant(tenant_id):
        raise HTTPException(status_code=404, detail="Tenant not found")
    return DeletedView()
