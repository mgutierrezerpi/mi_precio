from fastapi import APIRouter, HTTPException, Depends
from config import settings
from lib.ctx import identity, analytics, activity, plans
from controllers.deps import get_current_user, require_admin, require_owner
from controllers.input_types import CreateTenant, UpdateTenant, UpdatePlan
from views import TenantView, ActivityView, DeletedView

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("/{tenant_id}/stats/visits")
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
                    entity_type="tenant", entity_id=tenant_id)
    return TenantView.render(tenant)


@router.get("/{tenant_id}/stats/reports")
def reports_endpoint(tenant_id: str, days: int = 30, current_user: dict = Depends(get_current_user)):
    return analytics.reports(tenant_id, days)


@router.get("/{tenant_id}/activity")
def list_activity_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return ActivityView.render_many(activity.list_activity(tenant_id))


@router.get("")
def list_tenants_endpoint(current_user: dict = Depends(get_current_user)):
    return TenantView.render_many(identity.list_tenants())


@router.post("", status_code=201)
def create_tenant_endpoint(data: CreateTenant, current_user: dict = Depends(get_current_user)):
    tenant = identity.create_tenant(data.name, data.subdomain)
    if not tenant:
        raise HTTPException(status_code=400, detail="Subdomain already exists")
    return TenantView.render(tenant)


@router.get("/{tenant_id}")
def get_tenant_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    tenant = identity.get_tenant(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return TenantView.render(tenant)


@router.patch("/{tenant_id}")
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
