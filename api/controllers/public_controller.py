"""Public marketplace and catalog rendering endpoints."""

from fastapi import APIRouter, HTTPException, Query, Request

from controllers.public_interactions_controller import (
    router as public_interactions_router,
)
from controllers.public_leads_controller import public_leads_router
from controllers.public_request import request_ip
from lib.ctx import feature_flags, public, public_viewers
from views import PublicMagazineView, PublicMenuView, PublicTenantView

router = APIRouter(prefix="/public", tags=["public"])
router.include_router(public_interactions_router)
router.include_router(public_leads_router)


@router.get("/marketplace/nearby")
def nearby_marketplace_endpoint(
    latitude: float | None = Query(None, ge=-90, le=90),
    longitude: float | None = Query(None, ge=-180, le=180),
    category: str | None = Query(None, max_length=32),
    limit: int = Query(50, ge=1, le=100),
):
    """Discover opted-in businesses, ordered by proximity when available."""
    return [
        {
            "name": tenant.name,
            "subdomain": tenant.subdomain,
            "logo_url": tenant.logo_url,
            "description": tenant.description,
            "address": tenant.address,
            "business_category": tenant.business_category,
            "whatsapp_url": tenant.whatsapp_url,
            "website_url": tenant.website_url,
            "instagram_url": tenant.instagram_url,
            "distance_km": distance_km,
        }
        for tenant, distance_km in public.nearby_marketplace_tenants(
            latitude, longitude, limit, category
        )
    ]


@router.get("/{subdomain}/magazines/{magazine}")
def get_public_magazine(subdomain: str, magazine: str):
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant or not feature_flags.magazines_enabled(tenant.id):
        raise HTTPException(status_code=404, detail="Not found")
    published = public.get_public_magazine(tenant, magazine)
    if not published:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "tenant": PublicTenantView.render(tenant),
        "magazine": PublicMagazineView.render(published),
    }


@router.get("/{subdomain}")
def get_public_menu(
    subdomain: str,
    request: Request,
    list: str | None = None,
    magazine: str | None = None,
):
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant:
        raise HTTPException(status_code=404, detail="Not found")
    viewer_token = request.cookies.get(public_viewers.PUBLIC_VIEWER_COOKIE)
    published_lists = public.get_published_lists(tenant, list)
    # The business-level catalog URL is only valid when there is an actual
    # public list to show. Otherwise a Linktree catalog card led to an empty
    # storefront instead of behaving like an unavailable public page.
    if not list and not published_lists:
        raise HTTPException(status_code=404, detail="No published lists found")
    if list and published_lists and not public_viewers.has_list_access(
        published_lists[0].price_list, viewer_token
    ):
        raise HTTPException(status_code=403, detail="Access code required")
    published_magazines = (
        public.get_published_magazines(tenant, magazine)
        if feature_flags.magazines_enabled(tenant.id)
        else []
    )
    selected_list_id = (
        published_lists[0].price_list.id if list and published_lists else None
    )
    viewer_identified = public_viewers.touch_viewer(
        str(tenant.id), viewer_token, selected_list_id, request_ip(request)
    ) or public_viewers.has_viewer(str(tenant.id), viewer_token)
    return PublicMenuView.render(
        tenant,
        published_lists,
        viewer_identified,
        published_magazines=published_magazines,
    )
