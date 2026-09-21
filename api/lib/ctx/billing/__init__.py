"""Compatibility facade for billing operations."""

# ruff: noqa: F401

from config import settings
from lib.ctx.billing import sync_lookup
from lib.ctx.billing.checkout import billing_snapshot, create_checkout
from lib.ctx.billing.common import (
    ACTIVE_SUBSCRIPTION_STATUSES,
    PENDING_SYNC_DELAYS,
    BillingError,
    _parse_dt,
    activity_summary,
    expiry_notice_target,
    is_expired,
)
from lib.ctx.billing.gateway import (
    _lemonsqueezy_get,
    _ls_request,
    plan_for_variant,
    variant_for_plan,
    verify_lemonsqueezy_signature,
)
from lib.ctx.billing.lifecycle import (
    _cancel_without_gateway,
    _resume_without_gateway,
    _subscription_of,
    cancel_subscription,
    resume_subscription,
)
from lib.ctx.billing.sync_state import (
    _schedule_next_sync,
    begin_subscription_sync,
    clear_subscription_sync,
    defer_pending_subscription,
    due_pending_subscription_ids,
)
from lib.ctx.billing.updates import (
    expire_ended_subscriptions,
    expired_subscription_ids,
    sync_manual_subscription,
    sync_subscription_from_attributes,
)


def poll_pending_subscription(tenant_id: str, now=None):
    """Preserve the facade-level provider seam used by existing callers."""
    sync_lookup._lemonsqueezy_get = _lemonsqueezy_get
    return sync_lookup.poll_pending_subscription(tenant_id, now)


def reconcile_checkout_order(tenant_id: str, order_id: str):
    """Reconcile a checkout order through the focused lookup module."""
    sync_lookup._lemonsqueezy_get = _lemonsqueezy_get
    return sync_lookup.reconcile_checkout_order(tenant_id, order_id)
