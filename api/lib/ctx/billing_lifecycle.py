"""Cancellation and resumption of paid subscriptions."""

from __future__ import annotations

from datetime import timedelta

from config import settings
from lib.ctx.billing_common import (
    BillingError,
    BillingGatewayError,
    has_live_subscription,
)
from lib.ctx.billing_gateway import _ls_request, variant_for_plan
from lib.ctx.billing_updates import sync_subscription_from_attributes
from models import Tenant
from models.base import utc_now


def _cancel_without_gateway(tenant_id: str) -> Tenant | None:
    """Mirror a period-end cancellation locally when billing is disabled."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        raise BillingError("Tenant not found")
    if tenant.plan == "free":
        raise BillingError("Esta cuenta no tiene una suscripción activa.")
    tenant.billing_status = "cancelled"
    tenant.billing_ends_at = (
        tenant.billing_ends_at
        or tenant.billing_renews_at
        or (utc_now() + timedelta(days=30))
    )
    tenant.billing_renews_at = None
    tenant.save()
    return tenant


def _resume_without_gateway(tenant_id: str) -> Tenant | None:
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        raise BillingError("Tenant not found")
    if tenant.billing_status != "cancelled":
        raise BillingError("Esta suscripción no está cancelada.")
    tenant.billing_status = "active"
    tenant.billing_renews_at = tenant.billing_ends_at
    tenant.billing_ends_at = None
    tenant.save()
    return tenant


def _subscription_of(tenant_id: str) -> tuple[Tenant, str]:
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        raise BillingError("Tenant not found")
    if tenant.billing_provider != "lemonsqueezy" or not tenant.billing_subscription_id:
        raise BillingError(
            "Esta cuenta no tiene una suscripción de Lemon Squeezy para gestionar."
        )
    return tenant, tenant.billing_subscription_id


def cancel_subscription(tenant_id: str) -> Tenant | None:
    """Cancel at period end and immediately sync the provider response."""
    if not settings.billing_enabled:
        return _cancel_without_gateway(tenant_id)
    tenant, subscription_id = _subscription_of(tenant_id)
    if tenant.billing_status in ("cancelled", "expired"):
        return tenant
    data = _ls_request("DELETE", f"subscriptions/{subscription_id}")
    attrs = data.get("data", {}).get("attributes", {})
    if not attrs:
        raise BillingGatewayError(
            "Lemon Squeezy did not return the cancelled subscription"
        )
    attrs.setdefault("id", subscription_id)
    return sync_subscription_from_attributes(attrs, tenant_id=tenant_id)


def change_subscription_plan(tenant_id: str, plan: str) -> Tenant | None:
    """Move a live subscription to another plan, without a second checkout.

    Lemon Squeezy applies the plan at once and prorates the difference on the
    next invoice. Choosing a plan during a cancellation's grace period also
    undoes the cancellation: the customer is asking to keep paying.
    """
    tenant, subscription_id = _subscription_of(tenant_id)
    if not has_live_subscription(tenant):
        raise BillingError(
            "La suscripción ya venció. Elegí un plan para volver a activarla."
        )
    cancelled = tenant.billing_status == "cancelled"
    if tenant.plan == plan and not cancelled:
        raise BillingError("Ya estás en ese plan.")
    variant_id = variant_for_plan(plan)
    if not variant_id:
        raise BillingGatewayError(f"No Lemon Squeezy variant for plan {plan}")
    attributes: dict = {"variant_id": int(variant_id)}
    if cancelled:
        attributes["cancelled"] = False
    data = _ls_request(
        "PATCH",
        f"subscriptions/{subscription_id}",
        {
            "data": {
                "type": "subscriptions",
                "id": str(subscription_id),
                "attributes": attributes,
            }
        },
    )
    attrs = data.get("data", {}).get("attributes", {})
    if not attrs:
        raise BillingGatewayError(
            "Lemon Squeezy did not return the updated subscription"
        )
    attrs.setdefault("id", subscription_id)
    return sync_subscription_from_attributes(attrs, tenant_id=tenant_id)


def cancel_before_deleting(tenant_id: str) -> None:
    """Stop future charges for a business that is about to be deleted.

    Deleting the row also deletes the only reference to the subscription, so
    this has to succeed first: a provider failure raises and keeps the business.
    """
    if not settings.billing_enabled:
        return
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if (
        not tenant
        or tenant.billing_provider != "lemonsqueezy"
        or not tenant.billing_subscription_id
        or tenant.billing_status in ("cancelled", "expired")
    ):
        return
    try:
        _ls_request("DELETE", f"subscriptions/{tenant.billing_subscription_id}")
    except BillingGatewayError as exc:
        # Already gone at the provider: there is nothing left to charge.
        if exc.status != 404:
            raise


def resume_subscription(tenant_id: str) -> Tenant | None:
    """Undo a period-end cancellation before the subscription has lapsed."""
    if not settings.billing_enabled:
        return _resume_without_gateway(tenant_id)
    tenant, subscription_id = _subscription_of(tenant_id)
    if tenant.billing_status == "expired":
        raise BillingError(
            "La suscripción ya venció. Elegí un plan para volver a activarla."
        )
    data = _ls_request(
        "PATCH",
        f"subscriptions/{subscription_id}",
        {
            "data": {
                "type": "subscriptions",
                "id": str(subscription_id),
                "attributes": {"cancelled": False},
            }
        },
    )
    attrs = data.get("data", {}).get("attributes", {})
    if not attrs:
        raise BillingGatewayError(
            "Lemon Squeezy did not return the resumed subscription"
        )
    attrs.setdefault("id", subscription_id)
    return sync_subscription_from_attributes(attrs, tenant_id=tenant_id)
