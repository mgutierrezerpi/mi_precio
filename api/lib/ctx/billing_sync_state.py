"""State transitions and scheduling for pending subscription sync."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from lib.ctx.billing_common import PENDING_SYNC_DELAYS
from lib.ctx.billing_gateway import variant_for_plan
from models import Tenant
from models.base import utc_now


def begin_subscription_sync(tenant_id: str, checkout_id: str | None, plan: str) -> None:
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return
    now = utc_now()
    tenant.billing_provider = "lemonsqueezy"
    tenant.billing_variant_id = str(variant_for_plan(plan)) or None
    tenant.billing_checkout_id = checkout_id or None
    tenant.billing_order_id = None
    tenant.billing_sync_started_at = now
    tenant.billing_sync_next_at = now + timedelta(seconds=PENDING_SYNC_DELAYS[0])
    tenant.billing_sync_attempts = 0
    tenant.billing_status = "checkout_pending"
    tenant.save()


def clear_subscription_sync(tenant: Tenant) -> None:
    tenant.billing_checkout_id = None
    tenant.billing_order_id = None
    tenant.billing_sync_started_at = None
    tenant.billing_sync_next_at = None
    tenant.billing_sync_attempts = 0


def _schedule_next_sync(tenant: Tenant, now: datetime) -> int:
    attempt = int(tenant.billing_sync_attempts or 0)
    delay = PENDING_SYNC_DELAYS[min(attempt, len(PENDING_SYNC_DELAYS) - 1)]
    tenant.billing_sync_attempts = attempt + 1
    tenant.billing_sync_next_at = now + timedelta(seconds=delay)
    if attempt >= len(PENDING_SYNC_DELAYS) - 1:
        tenant.billing_sync_next_at = None
    tenant.save()
    return delay

def due_pending_subscription_ids(now: datetime | None = None) -> list[str]:
    current = now or utc_now()
    return [
        tenant.id
        for tenant in Tenant.select(Tenant.id).where(
            (Tenant.billing_sync_started_at.is_null(False))
            & (Tenant.billing_sync_next_at.is_null(False))
            & (Tenant.billing_sync_next_at <= current)
            & (Tenant.plan == "free")
        )
    ]


def defer_pending_subscription(
    tenant_id: str, now: datetime | None = None
) -> dict[str, Any]:
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant or not tenant.billing_sync_started_at:
        return {"status": "skipped"}
    return {
        "status": "pending",
        "delay": _schedule_next_sync(tenant, now or utc_now()),
    }
