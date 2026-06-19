"""Plans context - subscription tiers, usage, and limit enforcement.

There is no payment gateway yet, so changing plan is immediate (no charge).
What is real: per-plan limits on products, lists and team members, the current
usage, and enforcement when creating those resources."""

from config import settings
from models import Tenant, Product, PriceList, User, Invitation

# Per-plan limits. `None` means unlimited.
# Must mirror the advertised limits in web_app/src/lib/plans.ts (and the landing).
# Those marketing cards are the source of truth; enforcement here follows them.
PLANS: dict[str, dict[str, int | None]] = {
    "free": {"products": 10, "lists": 1, "members": 1},
    "micro": {"products": 25, "lists": 3, "members": 1},
    "plus": {"products": 300, "lists": 15, "members": 5},
    "pro": {"products": None, "lists": None, "members": None},
}
PLAN_ORDER = ["free", "micro", "plus", "pro"]

# Limited resource → message shown when the limit is reached.
LIMIT_MESSAGE = {
    "products": "Alcanzaste el límite de productos de tu plan. Subí de plan para agregar más.",
    "lists": "Alcanzaste el límite de listas de tu plan. Subí de plan para crear más.",
    "members": "Alcanzaste el límite de miembros de tu plan. Subí de plan para invitar a más personas.",
}


class PlanLimitError(Exception):
    """Raised when an action would exceed the tenant's plan limit (HTTP 402)."""


def normalize_plan(plan: str | None) -> str:
    if plan == "pyme":
        return "plus"
    return plan if plan in PLANS else "free"


def _usage(tenant_id: str) -> dict[str, int]:
    members = (
        User.select().where(User.tenant == tenant_id).count()
        + Invitation.select().where(Invitation.tenant == tenant_id, Invitation.status == "pending").count()
    )
    return {
        "products": Product.select().where(Product.tenant == tenant_id).count(),
        "lists": PriceList.select().where(PriceList.tenant == tenant_id).count(),
        "members": members,
    }


def plan_info(tenant_id: str) -> dict:
    """Current plan + its limits + current usage for the billing screen."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    plan = normalize_plan(getattr(tenant, "plan", "free")) if tenant else "free"
    # When billing is disabled there is no payment gateway, so the UI switches
    # plans immediately via PATCH instead of opening a checkout.
    info = {"plan": plan, "limits": PLANS[plan], "usage": _usage(tenant_id), "billing_enabled": settings.billing_enabled}
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
    plan = normalize_plan(getattr(tenant, "plan", "free")) if tenant else "free"
    limit = PLANS[plan].get(resource)
    if limit is None:
        return
    if _usage(tenant_id).get(resource, 0) >= limit:
        raise PlanLimitError(LIMIT_MESSAGE.get(resource, "Alcanzaste el límite de tu plan."))


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
