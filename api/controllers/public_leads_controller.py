"""Rate-limited public lead capture endpoint."""

from fastapi import APIRouter, HTTPException, Request

from controllers.input_types import CreateLead
from lib import rate_limit
from lib.ctx import leads, public
from lib.ctx.leads_context import LeadRejected

LEADS_PER_WINDOW = 5
LEADS_WINDOW_SECONDS = 600
public_leads_router = APIRouter()


@public_leads_router.post("/{subdomain}/leads", status_code=201)
def create_public_lead(subdomain: str, data: CreateLead, request: Request):
    """Store a public-list lead without exposing the shop's plan to visitors."""
    tenant = public.get_tenant_by_subdomain(subdomain)
    if not tenant:
        raise HTTPException(status_code=404, detail="Not found")
    if data.website:
        return {"ok": True}
    client = request.client.host if request.client else "unknown"
    if not rate_limit.allow(
        f"lead:{tenant.id}:{client}", LEADS_PER_WINDOW, LEADS_WINDOW_SECONDS
    ):
        raise HTTPException(status_code=429, detail="Probá de nuevo en un rato.")
    try:
        leads.create_lead(tenant.id, **data.model_dump(exclude={"website"}))
    except LeadRejected as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"ok": True}
