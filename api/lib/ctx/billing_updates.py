"""Provider and manual subscription persistence plus expiry cleanup."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from lib.ctx import plans
from lib.ctx.billing_common import BillingError, _parse_dt
from lib.ctx.billing_gateway import plan_for_variant
from lib.ctx.billing_sync_state import clear_subscription_sync
from models import Tenant
from models.base import utc_now


def sync_subscription_from_attributes(
    attrs: dict[str, Any], tenant_id: str | None = None
) -> Tenant | None:
    tenant_id = tenant_id or attrs.get("custom_data", {}).get("tenant_id")
    if not tenant_id:
        return None
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return None

    variant_id = attrs.get("variant_id")
    status = attrs.get("status")
    provider_plan = plan_for_variant(variant_id)

    tenant.billing_provider = "lemonsqueezy"
    tenant.billing_customer_id = str(attrs.get("customer_id") or "") or None
    tenant.billing_subscription_id = (
        str(attrs.get("id") or attrs.get("subscription_id") or "") or None
    )
    tenant.billing_variant_id = str(variant_id or "") or None
    tenant.billing_status = status
    tenant.billing_renews_at = _parse_dt(attrs.get("renews_at"))
    tenant.billing_ends_at = _parse_dt(attrs.get("ends_at"))
    tenant.billing_trial_ends_at = _parse_dt(attrs.get("trial_ends_at"))
    urls = attrs.get("urls") or {}
    tenant.billing_portal_url = urls.get("customer_portal")
    tenant.billing_update_payment_url = urls.get("update_payment_method")
    tenant.billing_card_brand = attrs.get("card_brand")
    tenant.billing_card_last_four = attrs.get("card_last_four")

    if status == "expired":
        tenant.plan = "free"
    elif provider_plan:
        tenant.plan = provider_plan

    clear_subscription_sync(tenant)
    tenant.save()
    return tenant


def sync_manual_subscription(
    tenant_id: str,
    plan: str,
    status: str = "active",
    subscription_id: str | None = None,
    customer_id: str | None = None,
    variant_id: str | None = None,
    renews_at: datetime | None = None,
    ends_at: datetime | None = None,
) -> Tenant | None:
    if plan not in plans.PLANS:
        raise BillingError("Invalid plan")
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return None
    tenant.plan = "free" if status == "expired" else plan
    tenant.billing_provider = "manual"
    tenant.billing_customer_id = customer_id
    tenant.billing_subscription_id = subscription_id
    tenant.billing_variant_id = variant_id
    tenant.billing_status = status
    tenant.billing_renews_at = renews_at
    tenant.billing_ends_at = ends_at
    clear_subscription_sync(tenant)
    tenant.save()
    return tenant


def expired_subscription_ids(now: datetime | None = None) -> list[str]:
    """Downgrade tenants whose paid subscription end date has passed.

    Webhooks should normally perform this immediately. The worker uses this as a
    backstop for missed manual updates or delayed provider webhooks.
    """
    cutoff = now or utc_now()
    condition = (
        (Tenant.billing_ends_at.is_null(False))
        & (Tenant.billing_ends_at <= cutoff)
        & (Tenant.billing_status != "expired")
        & (Tenant.plan != "free")
    )
    expired = [tenant.id for tenant in Tenant.select(Tenant.id).where(condition)]
    if expired:
        Tenant.update(plan="free", billing_status="expired").where(condition).execute()
    return expired


def expire_ended_subscriptions(now: datetime | None = None) -> int:
    """Expire subscriptions and return the count for existing callers."""
    return len(expired_subscription_ids(now))
