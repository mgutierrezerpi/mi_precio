from fastapi import APIRouter, HTTPException, Depends
from lib.ctx import identity, analytics
from controllers.deps import get_current_user
from controllers.input_types import CreateTenant, UpdateTenant
from views import TenantView

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("/{tenant_id}/stats/visits")
def visit_stats_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return analytics.visit_stats(tenant_id)


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
def update_tenant_endpoint(tenant_id: str, data: UpdateTenant, current_user: dict = Depends(get_current_user)):
    try:
        tenant = identity.update_tenant(
            tenant_id, name=data.name, subdomain=data.subdomain, currency=data.currency
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return TenantView.render(tenant)
