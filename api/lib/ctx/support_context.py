"""Support context: turns an in-app support request into a Freshdesk ticket.

Tickets are created fire-and-forward (Freshdesk is the source of truth — we do
not persist a local copy). The requester is the authenticated tenant owner, and
we enrich the ticket with tenant name/plan/id so support can triage without
asking the user for context.
"""

from __future__ import annotations

from typing import Any

from infra.zohodesk import client as zohodesk
from models import Tenant

VALID_PRIORITIES = {"low", "medium", "high", "urgent"}


def create_ticket(
    *,
    tenant_id: str,
    email: str,
    subject: str,
    description: str,
    priority: str = "medium",
    name: str | None = None,
) -> dict[str, Any]:
    """Create a Zoho Desk ticket on behalf of a tenant member.

    Raises ZohoDeskError when support is not configured or the provider call
    fails; the controller maps that to an HTTP error.
    """
    if priority not in VALID_PRIORITIES:
        priority = "medium"

    tenant = Tenant.get_or_none(Tenant.id == tenant_id)

    # Prefix the tenant context so agents see who is reporting at a glance
    # (Zoho Desk renders the description as HTML).
    context_lines = [f"Tenant: {tenant.name} ({tenant_id})" if tenant else f"Tenant: {tenant_id}"]
    if tenant:
        context_lines.append(f"Plan: {tenant.plan}")
        context_lines.append(f"Subdominio: {tenant.subdomain}")

    enriched_description = (
        "<br>".join(context_lines) + "<br><br>" + description.replace("\n", "<br>")
    )

    return zohodesk.create_ticket(
        email=email,
        subject=subject,
        description=enriched_description,
        priority=priority,
        name=name,
    )
