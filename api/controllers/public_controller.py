from fastapi import APIRouter, HTTPException, Query
from lib.ctx import public, analytics
from views import PublicMenuView

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/marketplace/nearby")
def nearby_marketplace_endpoint(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    limit: int = Query(50, ge=1, le=100),
):
    """Discover nearby businesses that explicitly chose to be listed."""
    return [
        {
            "name": tenant.name,
            "subdomain": tenant.subdomain,
            "logo_url": tenant.logo_url,
            "description": tenant.description,
            "address": tenant.address,
            "distance_km": distance_km,
        }
        for tenant, distance_km in public.nearby_marketplace_tenants(
            latitude, longitude, limit
        )
    ]


@router.get("/{subdomain}")
def get_public_menu(subdomain: str):
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant:
        raise HTTPException(status_code=404, detail="Not found")
    published_lists = public.get_published_lists(tenant)
    return PublicMenuView.render(tenant, published_lists)


@router.post("/{subdomain}/view")
def record_public_view(
    subdomain: str, list: str | None = None, source: str | None = None
):
    """Record a single visit to a tenant's public page (called once per open).

    `source` distinguishes QR scans ("qr") from direct/shared link visits.
    """
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant:
        raise HTTPException(status_code=404, detail="Not found")
    analytics.record_view(str(tenant.id), list_id=list, source=source)
    return {"ok": True}
