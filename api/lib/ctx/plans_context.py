"""Plans context - subscription tiers, trials, usage, and limit enforcement.

There is no payment gateway yet, so changing plan is immediate (no charge).
What is real: per-plan limits on products, lists and team members, the current
usage, and enforcement when creating those resources."""

from datetime import timedelta

from config import settings
from lib.ctx.plan_catalog import (
    LIMIT_MESSAGE,
    PLAN_FEATURES,
    PLAN_ORDER,
    PLANS,
    PlanLimitError,
)
from lib.ctx.plan_usage import usage
from models import Tenant
from models.base import utc_now

__all__ = [
    "PLANS",
    "PLAN_FEATURES",
    "PLAN_ORDER",
    "PlanLimitError",
    "assert_can_add",
    "has_feature",
    "trial_active",
    "live_list_allowance",
    "normalize_plan",
    "plan_info",
    "plan_required",
    "set_plan",
    "start_trial",
]

# Shown on the blocking plan screen when a gated tenant has no paid plan yet.
PLAN_REQUIRED_MESSAGE = "Elegí un plan para empezar a usar Mi Precio."
APP_TRIAL_DAYS = 14


def _ever_subscribed(tenant: Tenant) -> bool:
    """True once a tenant has had a subscription of any kind, ended or not."""
    return bool(
        getattr(tenant, "billing_status", None)
        or getattr(tenant, "billing_provider", None)
    )


def _has_subscription(tenant: Tenant) -> bool:
    """True only after checkout has produced a real provider subscription."""
    return bool(
        getattr(tenant, "billing_subscription_id", None)
        or getattr(tenant, "billing_status", None)
        not in (None, "checkout_pending")
    )


def trial_active(tenant: Tenant, now=None) -> bool:
    """Whether a never-subscribed tenant is inside its cardless app trial."""
    ends_at = getattr(tenant, "trial_ends_at", None)
    return bool(
        ends_at and not _has_subscription(tenant) and ends_at > (now or utc_now())
    )


def start_trial(tenant: Tenant, now=None) -> bool:
    """Start the tenant's one-time cardless trial."""
    if (
        normalize_plan(getattr(tenant, "plan", "free")) != "free"
        or _ever_subscribed(tenant)
        or getattr(tenant, "trial_started_at", None) is not None
    ):
        return False
    tenant.plan_gate = True
    started_at = now or utc_now()
    tenant.trial_started_at = started_at
    tenant.trial_ends_at = started_at + timedelta(days=APP_TRIAL_DAYS)
    tenant.save(only=[Tenant.plan_gate, Tenant.trial_started_at, Tenant.trial_ends_at])
    return True


def plan_required(tenant_id: str) -> bool:
    """True when the tenant must pick a paid plan before using the CRM.

    "free" is not a tier you can subscribe to — it is the absence of a plan. Two
    kinds of tenant land there and must pick one before going on:

    - signups after the paid onboarding shipped (they carry `plan_gate`);
    - anyone whose paid subscription ended, since the webhook drops them to free.

    Accounts that predate the paid onboarding and never subscribed are left
    alone: they keep the access they have always had."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return False
    if normalize_plan(getattr(tenant, "plan", "free")) != "free":
        return False
    if trial_active(tenant):
        return False
    if _ever_subscribed(tenant):
        return True
    return bool(getattr(tenant, "plan_gate", False))


def live_list_allowance(tenant: Tenant | None) -> int | None:
    """How many lists this tenant may keep on its public page. `None` = unlimited.

    Zero while a plan is required: an expired subscription takes the storefront
    offline, it does not quietly fall back to the free allowance."""
    if tenant is None:
        return 0
    if plan_required(tenant.id):
        return 0
    plan = "pro" if trial_active(tenant) else normalize_plan(tenant.plan)
    return PLANS[plan]["lists"]


def has_feature(tenant_id: str, feature: str) -> bool:
    """True when the tenant's tier includes a whole feature, like lead capture.

    A tier that has it loses it the moment a plan is required: an expired
    subscription takes the paid features with it, exactly as it takes the
    storefront offline."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant or plan_required(tenant_id):
        return False
    plan = "pro" if trial_active(tenant) else normalize_plan(tenant.plan)
    return feature in PLAN_FEATURES[plan]


def normalize_plan(plan: str | None) -> str:
    if plan == "pyme":
        return "plus"
    return plan if plan in PLANS else "free"


def plan_info(tenant_id: str) -> dict:
    """Current plan + its limits + current usage for the billing screen."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    stored_plan = normalize_plan(getattr(tenant, "plan", "free")) if tenant else "free"
    plan = "pro" if tenant and trial_active(tenant) else stored_plan
    # When billing is disabled there is no payment gateway, so the UI switches
    # plans immediately via PATCH instead of opening a checkout.
    info = {
        "plan": plan,
        "limits": PLANS[plan],
        # Sorted so the payload does not churn between requests.
        "features": sorted(PLAN_FEATURES[plan]),
        "usage": usage(tenant_id),
        "billing_enabled": settings.billing_enabled,
        # Lets the plan screen poll for the checkout/webhook to land.
        "plan_required": plan_required(tenant_id),
        "trial_ends_at": (getattr(tenant, "trial_ends_at", None) if tenant else None),
    }
    if tenant:
        info["billing"] = {
            "provider": tenant.billing_provider,
            "customer_id": tenant.billing_customer_id,
            "subscription_id": tenant.billing_subscription_id,
            "variant_id": tenant.billing_variant_id,
            "status": tenant.billing_status,
            "renews_at": tenant.billing_renews_at,
            "ends_at": tenant.billing_ends_at,
            "trial_ends_at": tenant.billing_trial_ends_at,
            "portal_url": tenant.billing_portal_url,
            "update_payment_url": tenant.billing_update_payment_url,
            "card_brand": tenant.billing_card_brand,
            "card_last_four": tenant.billing_card_last_four,
        }
    return info


def assert_can_add(tenant_id: str, resource: str) -> None:
    """Raise PlanLimitError if adding one more `resource` would exceed the plan limit."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    plan = (
        "pro"
        if tenant and trial_active(tenant)
        else normalize_plan(getattr(tenant, "plan", "free"))
        if tenant
        else "free"
    )
    limit = PLANS[plan].get(resource)
    if limit is None:
        return
    if usage(tenant_id).get(resource, 0) >= limit:
        raise PlanLimitError(
            LIMIT_MESSAGE.get(resource, "Alcanzaste el límite de tu plan.")
        )


def set_plan(tenant_id: str, plan: str) -> Tenant | None:
    if plan == "pyme":
        plan = "plus"
    if plan not in PLANS:
        raise ValueError("Invalid plan")
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return None
    tenant.plan = plan
    tenant.save()
    return tenant
