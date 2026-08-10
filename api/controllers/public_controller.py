import ipaddress

from fastapi import APIRouter, HTTPException, Query, Request, Response
from lib.ctx import public, analytics, public_viewers
from controllers.input_types import PublicViewerCapture, PublicViewerDismissal
from views import PublicMagazineView, PublicMenuView, PublicTenantView

router = APIRouter(prefix="/public", tags=["public"])


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
    if not tenant:
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
    published_lists = public.get_published_lists(tenant, list)
    published_magazines = public.get_published_magazines(tenant, magazine)
    viewer_token = request.cookies.get(public_viewers.PUBLIC_VIEWER_COOKIE) if request else None
    selected_list_id = published_lists[0].price_list.id if list and published_lists else None
    viewer_identified = public_viewers.touch_viewer(
        str(tenant.id), viewer_token, selected_list_id, _request_ip(request)
    )
    if not viewer_identified:
        viewer_identified = public_viewers.has_viewer(str(tenant.id), viewer_token)
    return PublicMenuView.render(
        tenant,
        published_lists,
        viewer_identified,
        published_magazines=published_magazines,
    )


@router.post("/{subdomain}/viewer")
def capture_public_viewer(
    subdomain: str,
    data: PublicViewerCapture,
    request: Request,
    response: Response,
):
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant:
        raise HTTPException(status_code=404, detail="Not found")
    viewer = public_viewers.capture_viewer(
        str(tenant.id),
        data.list_id,
        data.name,
        data.email,
        data.phone,
        request.cookies.get(public_viewers.PUBLIC_VIEWER_COOKIE),
        _request_ip(request),
    )
    if not viewer:
        raise HTTPException(status_code=400, detail="Viewer capture is not enabled")
    cookie_value = viewer.visitor_token
    if not cookie_value:
        raise HTTPException(status_code=500, detail="Could not create viewer cookie")
    response.set_cookie(
        key=public_viewers.PUBLIC_VIEWER_COOKIE,
        value=cookie_value,
        max_age=public_viewers.PUBLIC_VIEWER_COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=request.url.scheme == "https",
        path="/",
    )
    return {"ok": True}


@router.post("/{subdomain}/viewer-dismissed")
def record_public_viewer_dismissal(
    subdomain: str, data: PublicViewerDismissal
):
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant:
        raise HTTPException(status_code=404, detail="Not found")
    if not public_viewers.record_anonymous_dismissal(
        str(tenant.id), data.list_id
    ):
        raise HTTPException(status_code=400, detail="Viewer capture is not enabled")
    return {"ok": True}


def _request_ip(request: Request | None) -> str | None:
    """Resolve the client IP through the app's local reverse proxy."""
    if not request:
        return None
    client_host = request.client.host if request.client else None
    if client_host and client_host not in {"127.0.0.1", "::1"}:
        try:
            return str(ipaddress.ip_address(client_host))
        except ValueError:
            pass
    forwarded = request.headers.get("x-forwarded-for", "")
    for candidate in reversed([part.strip() for part in forwarded.split(",") if part.strip()]):
        try:
            return str(ipaddress.ip_address(candidate))
        except ValueError:
            continue
    try:
        return str(ipaddress.ip_address(client_host)) if client_host else None
    except ValueError:
        return None


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
