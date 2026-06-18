"""Billing context for manual and Lemon Squeezy subscription sync."""

from __future__ import annotations

import hashlib
import hmac
import json
from datetime import datetime
from typing import Any
from urllib import request, error

from config import settings
from models import Tenant
from lib.ctx import plans


class BillingError(Exception):
    """Raised when billing configuration or provider calls fail."""


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


def create_checkout(tenant_id: str, plan: str, email: str | None = None, name: str | None = None) -> str:
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

    payload = {
        "data": {
            "type": "checkouts",
            "attributes": {
                "checkout_data": {
                    "email": email,
                    "name": name,
                    "custom": {"tenant_id": tenant_id, "plan": plan},
                },
                "product_options": {
                    "enabled_variants": [int(variant_id)],
                },
            },
            "relationships": {
                "store": {"data": {"type": "stores", "id": settings.lemonsqueezy_store_id}},
                "variant": {"data": {"type": "variants", "id": variant_id}},
            },
        }
    }
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(
        "https://api.lemonsqueezy.com/v1/checkouts",
        data=body,
        method="POST",
        headers={
            "Accept": "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            "Authorization": f"Bearer {settings.lemonsqueezy_api_key}",
        },
    )
    try:
        with request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode("utf-8"))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise BillingError(f"Lemon Squeezy checkout failed: {detail}") from exc
    except OSError as exc:
        raise BillingError("Lemon Squeezy checkout request failed") from exc

    url = data.get("data", {}).get("attributes", {}).get("url")
    if not url:
        raise BillingError("Lemon Squeezy did not return a checkout URL")
    return url


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
