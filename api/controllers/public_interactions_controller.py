"""Public visitor identification and analytics endpoints."""

from fastapi import APIRouter, HTTPException, Request, Response

from controllers.input_types import PublicViewerCapture, PublicViewerDismissal
from controllers.public_request import request_ip
from lib.ctx import analytics, public, public_viewers

router = APIRouter()


def _tenant(subdomain: str):
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant:
        raise HTTPException(status_code=404, detail="Not found")
    return tenant


@router.post("/{subdomain}/viewer")
def capture_public_viewer(subdomain: str, data: PublicViewerCapture, request: Request, response: Response):
    tenant = _tenant(subdomain)
    viewer = public_viewers.capture_viewer(
        str(tenant.id),
        data.list_id,
        data.name,
        data.email,
        data.phone,
        request.cookies.get(public_viewers.PUBLIC_VIEWER_COOKIE),
        request_ip(request),
    )
    if not viewer:
        raise HTTPException(status_code=400, detail="Viewer capture is not enabled")
    if not viewer.visitor_token:
        raise HTTPException(status_code=500, detail="Could not create viewer cookie")
    response.set_cookie(
        key=public_viewers.PUBLIC_VIEWER_COOKIE,
        value=viewer.visitor_token,
        max_age=public_viewers.PUBLIC_VIEWER_COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=request.url.scheme == "https",
        path="/",
    )
    return {"ok": True}


@router.post("/{subdomain}/viewer-dismissed")
def record_public_viewer_dismissal(subdomain: str, data: PublicViewerDismissal):
    tenant = _tenant(subdomain)
    if not public_viewers.record_anonymous_dismissal(str(tenant.id), data.list_id):
        raise HTTPException(status_code=400, detail="Viewer capture is not enabled")
    return {"ok": True}


@router.post("/{subdomain}/view")
def record_public_view(subdomain: str, list: str | None = None, source: str | None = None):
    tenant = _tenant(subdomain)
    analytics.record_view(str(tenant.id), list_id=list, source=source)
    return {"ok": True}
