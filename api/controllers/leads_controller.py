from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from controllers.deps import get_current_user, require_editor
from lib.ctx import leads, plans
from views import CustomerView, LeadView

router = APIRouter(tags=["leads"])


class UpdateLeadStatus(BaseModel):
    status: str


class LinkLeadCustomer(BaseModel):
    customer_id: str | None = None


def _assert_tier(tenant_id: str) -> None:
    """Leads is a Plus/Pro feature. The screen hides itself on cheaper tiers,
    but the endpoints have to say no too — the UI is not the enforcement."""
    if not plans.has_feature(tenant_id, "leads"):
        raise HTTPException(
            status_code=402,
            detail="Los leads están disponibles en los planes Plus y Pro.",
        )


@router.get("/tenants/{tenant_id}/leads")
def list_leads_endpoint(
    tenant_id: str,
    status: str | None = Query(None, max_length=16),
    current_user: dict = Depends(get_current_user),
):
    _assert_tier(tenant_id)
    return LeadView.render_many(leads.list_leads(tenant_id, status))


@router.get("/tenants/{tenant_id}/media-kit-submissions")
def list_media_kit_submissions_endpoint(
    tenant_id: str, current_user: dict = Depends(get_current_user)
):
    """Media-kit enquiries live beside customers and are not plan-gated."""
    return LeadView.render_many(
        [lead for lead in leads.list_leads(tenant_id) if lead.source == "media_kit"]
    )


@router.patch("/tenants/{tenant_id}/leads/{lead_id}")
def update_lead_status_endpoint(
    tenant_id: str,
    lead_id: str,
    data: UpdateLeadStatus,
    current_user: dict = Depends(require_editor),
):
    _assert_tier(tenant_id)
    lead = leads.set_status(lead_id, data.status)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadView.render(lead)


@router.post("/tenants/{tenant_id}/leads/{lead_id}/convert", status_code=201)
def convert_lead_endpoint(
    tenant_id: str, lead_id: str, current_user: dict = Depends(require_editor)
):
    """Promotes a lead into the customers book. Already-converted leads answer
    409 rather than quietly creating the same person twice."""
    _assert_tier(tenant_id)
    customer = leads.convert_to_customer(lead_id)
    if not customer:
        raise HTTPException(status_code=409, detail="Ese lead ya es un cliente.")
    return CustomerView.render(customer)


@router.patch("/tenants/{tenant_id}/leads/{lead_id}/customer")
def link_lead_customer_endpoint(
    tenant_id: str, lead_id: str, data: LinkLeadCustomer,
    current_user: dict = Depends(require_editor),
):
    lead = leads.link_to_customer(tenant_id, lead_id, data.customer_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead or customer not found")
    return LeadView.render(lead)
