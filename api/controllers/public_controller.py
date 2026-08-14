from fastapi import APIRouter, HTTPException, Query, Request
from lib import rate_limit
from lib.ctx import public, analytics, leads
from lib.ctx.leads_context import LeadRejected
from controllers.input_types import CreateLead
from views import PublicMenuView

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
            "distance_km": distance_km,
        }
        for tenant, distance_km in public.nearby_marketplace_tenants(
            latitude, longitude, limit, category
        )
    ]


@router.get("/{subdomain}")
def get_public_menu(subdomain: str, list: str | None = None):
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant:
        raise HTTPException(status_code=404, detail="Not found")
    published_lists = public.get_published_lists(tenant, list)
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


# A stranger filling in a form should never hit this; a bot in a loop will.
LEADS_PER_WINDOW = 5
LEADS_WINDOW_SECONDS = 600


@router.post("/{subdomain}/leads", status_code=201)
def create_public_lead(subdomain: str, data: CreateLead, request: Request):
    """Someone left their details on a shop's public list.

    Answers 201 whether or not the lead was stored when the shop is not taking
    them. Whoever filled the form is the shop's customer, not ours: telling
    them the business has the wrong plan, or that the form was switched off
    while they typed, exposes our billing to a stranger and helps nobody.
    """
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant:
        raise HTTPException(status_code=404, detail="Not found")

    # Bots fill in every field they find; the real form keeps this one hidden.
    if data.website:
        return {"ok": True}

    client = request.client.host if request.client else "unknown"
    if not rate_limit.allow(
        f"lead:{tenant.id}:{client}", LEADS_PER_WINDOW, LEADS_WINDOW_SECONDS
    ):
        raise HTTPException(status_code=429, detail="Probá de nuevo en un rato.")

    payload = data.model_dump(exclude={"website"})
    try:
        leads.create_lead(tenant.id, **payload)
    except LeadRejected as err:
        # The one case worth telling them about: they can fix it and retry.
        raise HTTPException(status_code=400, detail=str(err))
    return {"ok": True}
