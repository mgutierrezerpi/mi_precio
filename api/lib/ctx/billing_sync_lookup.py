"""Provider lookups used to reconcile pending hosted checkouts."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from config import settings
from lib.ctx.billing_common import ACTIVE_SUBSCRIPTION_STATUSES, _parse_dt
from lib.ctx.billing_gateway import _lemonsqueezy_get
from lib.ctx.billing_sync_state import _schedule_next_sync, clear_subscription_sync
from lib.ctx.billing_updates import sync_subscription_from_attributes
from models import Tenant, User
from models.base import utc_now


def poll_pending_subscription(
    tenant_id: str, now: datetime | None = None
) -> dict[str, Any]:
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant or not tenant.billing_sync_started_at:
        return {"status": "skipped"}
    if tenant.plan != "free":
        clear_subscription_sync(tenant)
        tenant.save()
        return {"status": "active"}

    if tenant.billing_order_id:
        result = reconcile_checkout_order(tenant.id, tenant.billing_order_id)
        if result["status"] == "active":
            return result

    current = now or utc_now()
    if tenant.billing_sync_next_at and tenant.billing_sync_next_at > current:
        return {
            "status": "waiting",
            "delay": int((tenant.billing_sync_next_at - current).total_seconds()),
        }

    owner = User.get_or_none((User.tenant == tenant) & (User.role == "owner"))
    if not owner or not owner.email or not tenant.billing_variant_id:
        return {"status": "pending", "delay": _schedule_next_sync(tenant, current)}

    base_params = {
        "filter[store_id]": str(settings.lemonsqueezy_store_id),
        "filter[variant_id]": str(tenant.billing_variant_id),
        "page[size]": "100",
    }
    payload = _lemonsqueezy_get(
        "subscriptions", {**base_params, "filter[user_email]": owner.email}
    )
    items = payload.get("data", [])
    if not items:
        # The buyer can use a different email in the hosted checkout. Fall
        # back to recent subscriptions for this variant, but only auto-link a
        # single candidate so two simultaneous checkouts cannot cross tenants.
        candidates = _lemonsqueezy_get("subscriptions", base_params).get("data", [])
        recent = []
        for item in candidates:
            created_at = _parse_dt((item.get("attributes") or {}).get("created_at"))
            if (
                created_at
                and created_at.replace(tzinfo=None)
                >= tenant.billing_sync_started_at - timedelta(minutes=2)
                and (item.get("attributes") or {}).get("status")
                in ACTIVE_SUBSCRIPTION_STATUSES
            ):
                recent.append(item)
        items = recent if len(recent) == 1 else []

    for item in items:
        attrs = item.get("attributes") or {}
        created_at = _parse_dt(attrs.get("created_at"))
        if created_at and created_at.replace(
            tzinfo=None
        ) < tenant.billing_sync_started_at - timedelta(minutes=2):
            continue
        if attrs.get("status") not in ACTIVE_SUBSCRIPTION_STATUSES:
            continue
        attrs["id"] = item.get("id") or attrs.get("id")
        synced = sync_subscription_from_attributes(attrs, tenant_id=tenant.id)
        if synced:
            clear_subscription_sync(synced)
            synced.save()
            return {
                "status": "active",
                "subscription_id": synced.billing_subscription_id,
            }

    return {"status": "pending", "delay": _schedule_next_sync(tenant, current)}


def reconcile_checkout_order(tenant_id: str, order_id: str) -> dict[str, Any]:
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return {"status": "missing"}
    if tenant.plan != "free":
        clear_subscription_sync(tenant)
        tenant.save()
        return {"status": "active"}

    order_payload = _lemonsqueezy_get(f"orders/{order_id}", {"include": "order-items"})
    order = order_payload.get("data") or {}
    attrs = order.get("attributes") or {}
    item = attrs.get("first_order_item") or {}
    if str(attrs.get("store_id")) != str(settings.lemonsqueezy_store_id):
        return {"status": "invalid"}
    if attrs.get("status") != "paid":
        return {"status": "pending"}
    order_created = _parse_dt(attrs.get("created_at"))
    if (
        tenant.billing_sync_started_at
        and order_created
        and order_created.replace(tzinfo=None)
        < tenant.billing_sync_started_at - timedelta(minutes=2)
    ):
        return {"status": "invalid"}
    if tenant.billing_variant_id and str(item.get("variant_id")) != str(
        tenant.billing_variant_id
    ):
        return {"status": "invalid"}

    tenant.billing_order_id = str(order_id)
    tenant.save()
    subscriptions = _lemonsqueezy_get(f"orders/{order_id}/subscriptions", {}).get(
        "data", []
    )
    for subscription in subscriptions:
        subscription_attrs = subscription.get("attributes") or {}
        if subscription_attrs.get("status") not in ACTIVE_SUBSCRIPTION_STATUSES:
            continue
        subscription_attrs["id"] = subscription.get("id") or subscription_attrs.get(
            "id"
        )
        synced = sync_subscription_from_attributes(
            subscription_attrs, tenant_id=tenant.id
        )
        if synced:
            clear_subscription_sync(synced)
            synced.save()
            return {
                "status": "active",
                "subscription_id": synced.billing_subscription_id,
            }
    return {"status": "pending"}
