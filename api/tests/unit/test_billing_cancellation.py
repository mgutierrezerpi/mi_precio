"""Cancel / resume a subscription.

These cover the no-gateway path used in local dev (`BILLING_ENABLED=false`).
The Lemon Squeezy branch is exercised against the provider, not here.
"""

from datetime import datetime, timedelta

import pytest

from config import settings
from lib.ctx import billing_context as billing
from lib.ctx import identity


@pytest.fixture
def gateway_off(monkeypatch):
    monkeypatch.setattr(settings, "billing_enabled", False)


def _paid_tenant(plan="plus", **extra):
    tenant = identity.create_tenant("Test Store", "test_store")
    tenant.plan = plan
    for key, value in extra.items():
        setattr(tenant, key, value)
    tenant.save()
    return tenant


def test_cancel_keeps_the_plan_until_the_period_ends(db, gateway_off):
    ends = datetime.utcnow() + timedelta(days=12)
    tenant = _paid_tenant(billing_renews_at=ends)

    updated = billing.cancel_subscription(tenant.id)

    # Still paid — cancelling is not an immediate downgrade.
    assert updated.plan == "plus"
    assert updated.billing_status == "cancelled"
    assert updated.billing_ends_at == ends
    assert updated.billing_renews_at is None


def test_cancel_without_a_renewal_date_falls_back_to_a_month(db, gateway_off):
    tenant = _paid_tenant()

    updated = billing.cancel_subscription(tenant.id)

    assert updated.billing_ends_at is not None
    assert updated.billing_ends_at > datetime.utcnow()


def test_cancel_is_idempotent(db, gateway_off):
    tenant = _paid_tenant(billing_renews_at=datetime.utcnow() + timedelta(days=5))
    first = billing.cancel_subscription(tenant.id)

    second = billing.cancel_subscription(tenant.id)

    assert second.billing_status == "cancelled"
    assert second.billing_ends_at == first.billing_ends_at


def test_cancel_needs_an_actual_subscription(db, gateway_off):
    tenant = _paid_tenant(plan="free")

    with pytest.raises(billing.BillingError):
        billing.cancel_subscription(tenant.id)


def test_resume_puts_the_renewal_back(db, gateway_off):
    tenant = _paid_tenant(billing_renews_at=datetime.utcnow() + timedelta(days=9))
    cancelled = billing.cancel_subscription(tenant.id)
    ends = cancelled.billing_ends_at

    updated = billing.resume_subscription(tenant.id)

    assert updated.billing_status == "active"
    assert updated.billing_renews_at == ends
    assert updated.billing_ends_at is None


def test_resume_only_applies_to_a_cancelled_subscription(db, gateway_off):
    tenant = _paid_tenant(billing_status="active")

    with pytest.raises(billing.BillingError):
        billing.resume_subscription(tenant.id)


def test_expiry_backstop_downgrades_a_lapsed_cancellation(db, gateway_off):
    tenant = _paid_tenant(billing_renews_at=datetime.utcnow() - timedelta(days=1))
    billing.cancel_subscription(tenant.id)

    billing.expire_ended_subscriptions()

    tenant = identity.get_tenant(tenant.id)
    assert tenant.plan == "free"
    assert tenant.billing_status == "expired"
