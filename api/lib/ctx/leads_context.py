"""Leads context - inbound contacts captured on a shop's public list.

Two things arrive here: the lead form at the foot of a list, and the contact
details someone typed into the cart before ordering by WhatsApp. The second was
previously lost whenever the WhatsApp message was never actually sent, which is
the most common way a shop loses its warmest lead.
"""

from lib.ctx import activity_context as activity
from lib.ctx import plans_context as plans
from lib.ctx.lead_validation import (
    MAX_MESSAGE,
    SOURCES,
    STATUSES,
    LeadRejected,
    clean_email,
    clean_phone,
)
from models import Customer, Lead, Tenant


def leads_open(tenant: Tenant | None) -> bool:
    """Whether a shop is currently accepting leads.

    Both conditions have to hold: the tier includes the feature, and the shop
    turned it on. A tier that loses the feature stops accepting silently rather
    than erroring at a visitor who did nothing wrong."""
    if not tenant:
        return False
    return bool(getattr(tenant, "leads_enabled", False)) and plans.has_feature(
        tenant.id, "leads"
    )


def create_lead(
    tenant_id: str,
    name: str,
    phone: str | None = None,
    email: str | None = None,
    message: str | None = None,
    list_id: str | None = None,
    list_name: str | None = None,
    source: str = "form",
) -> Lead | None:
    """Records an inbound contact. Returns None when the shop is not taking them.

    None rather than an exception for the closed case: the public endpoint
    answers the visitor the same way either way, and a shop that turned the
    form off mid-session should not produce an error page for someone who was
    already looking at it."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    # A published media kit is itself a lead-generation surface. It must keep
    # accepting its contact form even when the optional price-list lead form is
    # disabled for the tenant.
    if not leads_open(tenant) and source != "media_kit":
        return None

    name = (name or "").strip()
    if not name:
        raise LeadRejected("Necesitamos tu nombre.")

    phone = clean_phone(phone)
    email = clean_email(email)
    if not phone and not email:
        raise LeadRejected("Dejanos un teléfono o un email para contestarte.")

    lead = Lead.create(
        tenant=tenant,
        name=name[:255],
        phone=phone,
        email=email,
        message=(message or "").strip()[:MAX_MESSAGE] or None,
        list_id=list_id,
        list_name=(list_name or "").strip()[:255] or None,
        source=source if source in SOURCES else "form",
    )

    # Feeds the notification bell. A lead nobody sees for two days is a lead
    # lost, so this is the point of the whole feature.
    activity.record(
        tenant_id,
        "lead.created",
        f"{name} dejó sus datos",
        entity_type="lead",
        entity_id=lead.id,
        meta={"source": lead.source, "list": lead.list_name},
    )
    return lead


def list_leads(tenant_id: str, status: str | None = None) -> list[Lead]:
    """A tenant's leads, newest first — an inbox, so the newest is the point."""
    query = Lead.select().where(Lead.tenant == tenant_id)
    if status in STATUSES:
        query = query.where(Lead.status == status)
    return list(query.order_by(Lead.created_at.desc()))


def list_customer_submissions(customer_id: str) -> list[Lead]:
    """Form submissions explicitly associated with one CRM customer."""
    return list(
        Lead.select()
        .where(Lead.customer == customer_id)
        .order_by(Lead.created_at.desc())
    )


def delete_lead(tenant_id: str, lead_id: str) -> bool:
    """Permanently remove one submission owned by the requesting tenant."""
    return bool(
        Lead.delete()
        .where((Lead.id == lead_id) & (Lead.tenant == tenant_id))
        .execute()
    )


def set_status(lead_id: str, status: str) -> Lead | None:
    if status not in STATUSES:
        return None
    lead = Lead.get_or_none(Lead.id == lead_id)
    if not lead:
        return None
    lead.status = status
    lead.save()
    return lead


def convert_to_customer(lead_id: str) -> Customer | None:
    """Promotes a lead into the customers book.

    Converting an already-converted lead is a no-op rather than a second
    customer: the shop clicking twice is far likelier than it wanting the
    same person recorded again."""
    lead = Lead.get_or_none(Lead.id == lead_id)
    if not lead or lead.status == "converted":
        return None

    customer = Customer.create(
        tenant=lead.tenant,
        name=lead.name,
        email=lead.email,
        phone=lead.phone,
        notes=lead.message,
    )
    lead.status = "converted"
    lead.save()
    activity.record(
        lead.tenant_id,
        "customer.created",
        f"{lead.name} pasó a clientes",
        entity_type="customer",
        entity_id=customer.id,
    )
    return customer


def link_to_customer(tenant_id: str, lead_id: str, customer_id: str | None) -> Lead | None:
    lead = Lead.get_or_none(Lead.id == lead_id, Lead.tenant == tenant_id)
    if not lead:
        return None
    if customer_id:
        customer = Customer.get_or_none(Customer.id == customer_id, Customer.tenant == tenant_id)
        if not customer:
            return None
        lead.customer = customer
        lead.status = "contacted"
    else:
        lead.customer = None
    lead.save()
    return lead
