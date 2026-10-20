"""Shared billing domain values and tenant lookups."""

from __future__ import annotations

from datetime import datetime

from models import Tenant, TenantMembership, User


class BillingError(Exception):
    """Raised when billing configuration or provider calls fail."""


def is_expired(tenant_id: str) -> bool:
    """Whether the tenant is already in the expired state (before a sync runs)."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    return bool(tenant and tenant.billing_status == "expired")


def owner_of(tenant_id: str) -> User | None:
    """The owner of a business, read from its memberships.

    `User.tenant`/`User.role` only describe the business a user signed up
    with, so they miss owners of a second business and anyone whose legacy
    role was overwritten from another team."""
    return (
        User.select()
        .join(TenantMembership, on=(TenantMembership.user == User.id))
        .where(
            (TenantMembership.tenant == tenant_id) & (TenantMembership.role == "owner")
        )
        .order_by(TenantMembership.created_at)
        .first()
    )


def expiry_notice_target(tenant_id: str) -> tuple[str, str] | None:
    """Return the owner email and business name for an expiry notice."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return None
    owner = owner_of(tenant_id)
    if not owner or not owner.email:
        return None
    return owner.email, tenant.name


# Human-readable Spanish labels for Lemon Squeezy events/statuses so the
# activity feed never surfaces raw snake_case codes to the user.
_EVENT_ES = {
    "subscription_created": "Suscripción iniciada",
    "subscription_updated": "Suscripción actualizada",
    "subscription_cancelled": "Suscripción cancelada",
    "subscription_resumed": "Suscripción reanudada",
    "subscription_expired": "Suscripción vencida",
    "subscription_paused": "Suscripción pausada",
    "subscription_unpaused": "Suscripción reactivada",
    "subscription_payment_success": "Pago confirmado",
    "subscription_payment_failed": "Pago rechazado",
    "subscription_payment_recovered": "Pago recuperado",
    "subscription_plan_changed": "Plan actualizado",
}

PENDING_SYNC_DELAYS = (10, 20, 40, 80, 160, 320, 640, 900)
ACTIVE_SUBSCRIPTION_STATUSES = {"active", "on_trial", "paused", "past_due"}


def _plan_es(plan: str | None) -> str | None:
    if not plan:
        return None
    return "Gratis" if plan == "free" else plan.capitalize()


def activity_summary(event_name: str, plan: str | None = None) -> str:
    """Turn a Lemon Squeezy event into a friendly Spanish activity line.

    This is the stored fallback; the frontend rebuilds the same line per-locale
    from the activity `action` + `meta` (event/plan/status)."""
    label = _EVENT_ES.get(event_name, event_name.replace("_", " ").capitalize())
    plan_name = _plan_es(plan)
    return f"{label} · plan {plan_name}" if plan_name else label


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))
