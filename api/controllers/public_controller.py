from fastapi import APIRouter, HTTPException
from lib.ctx import public, analytics
from views import PublicMenuView

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/{subdomain}")
def get_public_menu(subdomain: str):
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant:
        raise HTTPException(status_code=404, detail="Not found")
    published_lists = public.get_published_lists(tenant)
    return PublicMenuView.render(tenant, published_lists)


@router.post("/{subdomain}/view")
def record_public_view(subdomain: str, list: str | None = None):
    """Record a single visit to a tenant's public page (called once per open)."""
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant:
        raise HTTPException(status_code=404, detail="Not found")
    analytics.record_view(tenant.id, list_id=list)
    return {"ok": True}
