from fastapi import APIRouter, HTTPException, Depends, Query
from config import settings
from lib.ctx import identity, analytics, activity, plans
from controllers.deps import get_current_user, require_active_plan, require_admin, require_owner
from controllers.input_types import CreateTenant, UpdateTenant, UpdatePlan
from views import TenantView, ActivityView, DeletedView, AuthTokenView
from lib import encode_token
from models import User
from lib.value_objects import AuthResult

router = APIRouter(prefix="/tenants", tags=["tenants"])

# CRM data on this router, closed while the tenant owes us a plan. Reading the
# tenant, reading/changing the plan and deleting the account stay open so a
# gated owner can still get out of the plan screen.
plan_gated = [Depends(require_active_plan)]


@router.get("/{tenant_id}/stats/visits", dependencies=plan_gated)
def visit_stats_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return analytics.visit_stats(tenant_id)


@router.get("/{tenant_id}/plan")
def plan_info_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return plans.plan_info(tenant_id)


@router.patch("/{tenant_id}/plan")
def update_plan_endpoint(tenant_id: str, data: UpdatePlan, current_user: dict = Depends(require_owner)):
    if settings.billing_enabled and data.plan != "free":
        raise HTTPException(status_code=402, detail="Los planes pagos se activan desde facturación.")
    if current_user.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=403, detail="No tenés permisos para esta acción")
    try:
        tenant = plans.set_plan(tenant_id, data.plan)
    except ValueError:
        raise HTTPException(status_code=400, detail="Plan inválido")
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    activity.record(tenant_id, "plan.changed", f"Cambió el plan a {data.plan}",
                    actor=current_user.get("email"), actor_id=current_user.get("sub"),
                    entity_type="tenant", entity_id=tenant_id, meta={"plan": data.plan})
    return TenantView.render(tenant)


@router.get("/{tenant_id}/stats/reports", dependencies=plan_gated)
def reports_endpoint(tenant_id: str, days: int = 30, current_user: dict = Depends(get_current_user)):
    return analytics.reports(tenant_id, days)


@router.get("/{tenant_id}/activity", dependencies=plan_gated)
def list_activity_endpoint(tenant_id: str, limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0), current_user: dict = Depends(get_current_user)):
    return ActivityView.render_many(activity.list_activity(tenant_id, limit=limit, offset=offset))


@router.get("")
def list_tenants_endpoint(current_user: dict = Depends(get_current_user)):
    return TenantView.render_many(identity.list_tenants(current_user.get("sub")))


@router.post("", status_code=201)
def create_tenant_endpoint(data: CreateTenant, current_user: dict = Depends(get_current_user)):
    tenant = identity.create_tenant(data.name, data.subdomain, current_user.get("sub"))
    if not tenant:
        raise HTTPException(status_code=400, detail="No se pudo crear el negocio. Revisá el nombre o subdominio.")
    return TenantView.render(tenant)


@router.post("/{tenant_id}/switch")
def switch_tenant_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    member = identity.membership(current_user.get("sub"), tenant_id)
    tenant = identity.get_tenant(tenant_id)
    user = User.get_or_none(User.id == current_user.get("sub"))
    if not member or not tenant or not user:
        raise HTTPException(status_code=403, detail="No tenés acceso a este negocio")
    token = encode_token(str(user.id), user.email, tenant.id, member.role)
    return AuthTokenView.render(AuthResult(token, user, tenant, member.role))


@router.get("/{tenant_id}")
def get_tenant_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    tenant = identity.get_tenant(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return TenantView.render(tenant)


@router.patch("/{tenant_id}", dependencies=plan_gated)
def update_tenant_endpoint(tenant_id: str, data: UpdateTenant, current_user: dict = Depends(require_admin)):
    try:
        tenant = identity.update_tenant(tenant_id, **data.model_dump(exclude_unset=True))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return TenantView.render(tenant)


@router.delete("/{tenant_id}")
def delete_tenant_endpoint(tenant_id: str, current_user: dict = Depends(require_owner)):
    # An owner can only delete their own account.
    if current_user.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=403, detail="No tenés permisos para esta acción")
    if not identity.delete_tenant(tenant_id):
        raise HTTPException(status_code=404, detail="Tenant not found")
    return DeletedView()
