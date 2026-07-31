"""Billing context for manual and Lemon Squeezy subscription sync."""

from __future__ import annotations

import hashlib
import hmac
import json
from datetime import datetime, timedelta
from typing import Any
from urllib import request, error

from config import settings
from models import Tenant
from lib.ctx import plans


class BillingError(Exception):
    """Raised when billing configuration or provider calls fail."""


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


def _variant_to_plan() -> dict[str, str]:
    mapping: dict[str, str] = {}
    if settings.lemonsqueezy_variant_micro:
        mapping[settings.lemonsqueezy_variant_micro] = "micro"
    if settings.lemonsqueezy_variant_plus:
        mapping[settings.lemonsqueezy_variant_plus] = "plus"
    if settings.lemonsqueezy_variant_pyme:
        mapping[settings.lemonsqueezy_variant_pyme] = "plus"
    if settings.lemonsqueezy_variant_pro:
        mapping[settings.lemonsqueezy_variant_pro] = "pro"
    return mapping


def plan_for_variant(variant_id: str | int | None) -> str | None:
    if variant_id is None:
        return None
    return _variant_to_plan().get(str(variant_id))


def variant_for_plan(plan: str) -> str:
    if plan == "micro":
        return settings.lemonsqueezy_variant_micro
    if plan == "plus":
        return settings.lemonsqueezy_variant_plus or settings.lemonsqueezy_variant_pyme
    if plan == "pro":
        return settings.lemonsqueezy_variant_pro
    raise BillingError("Only paid plans can create Lemon Squeezy checkouts")


def _ls_request(method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    """Call the Lemon Squeezy API and return the decoded JSON body."""
    if not settings.lemonsqueezy_api_key:
        raise BillingError("Lemon Squeezy is not configured")
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = request.Request(
        f"https://api.lemonsqueezy.com/v1/{path.lstrip('/')}",
        data=body,
        method=method,
        headers={
            "Accept": "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            "Authorization": f"Bearer {settings.lemonsqueezy_api_key}",
        },
    )
    try:
        with request.urlopen(req, timeout=10) as res:
            raw = res.read().decode("utf-8")
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise BillingError(f"Lemon Squeezy {method} {path} failed: {detail}") from exc
    except OSError as exc:
        raise BillingError(f"Lemon Squeezy {method} {path} request failed") from exc
    return json.loads(raw) if raw else {}


def verify_lemonsqueezy_signature(raw_body: bytes, signature: str | None) -> bool:
    if not settings.lemonsqueezy_webhook_secret or not signature:
        return False
    digest = hmac.new(settings.lemonsqueezy_webhook_secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, signature)


def billing_snapshot(tenant: Tenant) -> dict[str, Any]:
    return {
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


def create_checkout(
    tenant_id: str,
    plan: str,
    email: str | None = None,
    name: str | None = None,
    redirect_url: str | None = None,
) -> str:
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        raise BillingError("Tenant not found")
    if plan not in plans.PLANS or plan == "free":
        raise BillingError("Invalid paid plan")
    if not settings.lemonsqueezy_api_key or not settings.lemonsqueezy_store_id:
        raise BillingError("Lemon Squeezy is not configured")

    variant_id = variant_for_plan(plan)
    if not variant_id:
        raise BillingError(f"Lemon Squeezy variant is not configured for {plan}")

    product_options: dict[str, Any] = {"enabled_variants": [int(variant_id)]}
    if redirect_url:
        product_options["redirect_url"] = redirect_url
    checkout_data: dict[str, Any] = {"custom": {"tenant_id": tenant_id, "plan": plan}}
    if email:
        checkout_data["email"] = email
    if name:
        checkout_data["name"] = name

    payload = {
        "data": {
            "type": "checkouts",
            "attributes": {
                "checkout_data": checkout_data,
                "product_options": product_options,
            },
            "relationships": {
                "store": {"data": {"type": "stores", "id": settings.lemonsqueezy_store_id}},
                "variant": {"data": {"type": "variants", "id": variant_id}},
            },
        }
    }
    data = _ls_request("POST", "checkouts", payload)
    url = data.get("data", {}).get("attributes", {}).get("url")
    if not url:
        raise BillingError("Lemon Squeezy did not return a checkout URL")
    return url


def _cancel_without_gateway(tenant_id: str) -> Tenant | None:
    """Local dev (`BILLING_ENABLED=false`) has no provider to call, so mimic the
    "cancel now, keep access until the period ends" behaviour on our own row.
    The Huey backstop (`expire_ended_subscriptions`) drops it to free later."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        raise BillingError("Tenant not found")
    if tenant.plan == "free":
        raise BillingError("Esta cuenta no tiene una suscripción activa.")
    tenant.billing_status = "cancelled"
    tenant.billing_ends_at = tenant.billing_ends_at or tenant.billing_renews_at or (datetime.utcnow() + timedelta(days=30))
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
        raise BillingError("Esta cuenta no tiene una suscripción de Lemon Squeezy para gestionar.")
    return tenant, tenant.billing_subscription_id


def cancel_subscription(tenant_id: str) -> Tenant | None:
    """Cancel at the end of the paid period.

    Lemon Squeezy keeps the subscription usable until `ends_at` and only then
    fires `subscription_expired`, which drops the tenant back to free. We sync
    the response straight away so the UI shows "cancelled, active until X"
    without waiting for the webhook.
    """
    if not settings.billing_enabled:
        return _cancel_without_gateway(tenant_id)
    tenant, subscription_id = _subscription_of(tenant_id)
    if tenant.billing_status in ("cancelled", "expired"):
        return tenant
    data = _ls_request("DELETE", f"subscriptions/{subscription_id}")
    attrs = data.get("data", {}).get("attributes", {})
    if not attrs:
        raise BillingError("Lemon Squeezy did not return the cancelled subscription")
    attrs.setdefault("id", subscription_id)
    return sync_subscription_from_attributes(attrs, tenant_id=tenant_id)


def resume_subscription(tenant_id: str) -> Tenant | None:
    """Undo a cancellation that has not lapsed yet (`cancelled` → `active`)."""
    if not settings.billing_enabled:
        return _resume_without_gateway(tenant_id)
    tenant, subscription_id = _subscription_of(tenant_id)
    if tenant.billing_status == "expired":
        raise BillingError("La suscripción ya venció. Elegí un plan para volver a activarla.")
    payload = {
        "data": {
            "type": "subscriptions",
            "id": str(subscription_id),
            "attributes": {"cancelled": False},
        }
    }
    data = _ls_request("PATCH", f"subscriptions/{subscription_id}", payload)
    attrs = data.get("data", {}).get("attributes", {})
    if not attrs:
        raise BillingError("Lemon Squeezy did not return the resumed subscription")
    attrs.setdefault("id", subscription_id)
    return sync_subscription_from_attributes(attrs, tenant_id=tenant_id)


def sync_subscription_from_attributes(attrs: dict[str, Any], tenant_id: str | None = None) -> Tenant | None:
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
    tenant.billing_subscription_id = str(attrs.get("id") or attrs.get("subscription_id") or "") or None
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
    tenant.save()
    return tenant


def expire_ended_subscriptions(now: datetime | None = None) -> int:
    """Downgrade tenants whose paid subscription end date has passed.

    Webhooks should normally perform this immediately. The worker uses this as a
    backstop for missed manual updates or delayed provider webhooks.
    """
    cutoff = now or datetime.utcnow()
    query = (
        Tenant.update(plan="free", billing_status="expired")
        .where(
            (Tenant.billing_ends_at.is_null(False))
            & (Tenant.billing_ends_at <= cutoff)
            & (Tenant.billing_status != "expired")
            & (Tenant.plan != "free")
        )
    )
    return query.execute()
