from fastapi import APIRouter, HTTPException
from lib.ctx import public
from views import PublicMenuView

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/{subdomain}")
def get_public_menu(subdomain: str):
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant:
        raise HTTPException(status_code=404, detail="Not found")
    published_lists = public.get_published_lists(tenant)
    return PublicMenuView.render(tenant, published_lists)
