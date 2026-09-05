"""Hosted checkout creation and serializable billing state."""

from __future__ import annotations

import json
from typing import Any
from urllib import error, request

from config import settings
from lib.ctx import plans
from lib.ctx.billing_common import BillingError
from lib.ctx.billing_gateway import variant_for_plan
from models import Tenant


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
    locale: str = "es",
) -> dict[str, str]:
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
    checkout_options = {"locale": "en" if locale == "en" else "es"}
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
                "checkout_options": checkout_options,
                "product_options": product_options,
            },
            "relationships": {
                "store": {
                    "data": {"type": "stores", "id": settings.lemonsqueezy_store_id}
                },
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

    checkout = data.get("data", {})
    url = checkout.get("attributes", {}).get("url")
    if not url:
        raise BillingError("Lemon Squeezy did not return a checkout URL")
    return {"url": url, "checkout_id": str(checkout.get("id") or "")}
