"""Unit tests for billing maintenance."""

from datetime import datetime, timedelta, timezone

from lib.ctx import billing_context as billing
from models import Tenant, User


def test_expire_ended_subscriptions_downgrades_paid_tenants(db):
    tenant = Tenant.create(
        name="Shop",
        subdomain="shop",
        currency="UYU",
        plan="plus",
        billing_status="active",
        billing_ends_at=datetime.utcnow() - timedelta(minutes=1),
    )

    assert len(billing.expire_ended_subscriptions()) == 1

    tenant = Tenant.get_by_id(tenant.id)
    assert tenant.plan == "free"
    assert tenant.billing_status == "expired"


def test_expire_ended_subscriptions_keeps_future_subscription(db):
    tenant = Tenant.create(
        name="Shop",
        subdomain="shop",
        currency="UYU",
        plan="plus",
        billing_status="active",
        billing_ends_at=datetime.utcnow() + timedelta(days=1),
    )

    assert len(billing.expire_ended_subscriptions()) == 0

    tenant = Tenant.get_by_id(tenant.id)
    assert tenant.plan == "plus"
    assert tenant.billing_status == "active"


def test_pending_subscription_poll_uses_provider_state_and_clears_backstop(
    db, monkeypatch
):
    tenant = Tenant.create(
        name="Shop", subdomain="shop", currency="UYU", plan_gate=True
    )
    User.create(email="owner@shop.com", tenant=tenant, role="owner")
    started = datetime.utcnow() - timedelta(seconds=11)
    monkeypatch.setattr(billing.settings, "lemonsqueezy_store_id", "store")
    monkeypatch.setattr(billing.settings, "lemonsqueezy_variant_micro", "micro-variant")
    billing.begin_subscription_sync(tenant.id, "checkout-1", "micro")
    tenant.billing_sync_started_at = started
    tenant.billing_sync_next_at = started
    tenant.save()
    monkeypatch.setattr(
        billing,
        "_lemonsqueezy_get",
        lambda path, params: {
            "data": [
                {
                    "id": "subscription-1",
                    "attributes": {
                        "variant_id": "micro-variant",
                        "status": "on_trial",
                        "created_at": (started + timedelta(seconds=1))
                        .replace(tzinfo=timezone.utc)
                        .isoformat(),
                        "trial_ends_at": "2026-08-18T00:00:00Z",
                    },
                }
            ],
        },
    )

    result = billing.poll_pending_subscription(tenant.id, now=datetime.utcnow())

    tenant = Tenant.get_by_id(tenant.id)
    assert result == {"status": "active", "subscription_id": "subscription-1"}
    assert tenant.plan == "micro"
    assert tenant.billing_status == "on_trial"
    assert tenant.billing_checkout_id is None
    assert tenant.billing_sync_next_at is None


def test_pending_subscription_poll_backoff_increases(db, monkeypatch):
    tenant = Tenant.create(
        name="Shop", subdomain="shop", currency="UYU", plan_gate=True
    )
    User.create(email="owner@shop.com", tenant=tenant, role="owner")
    now = datetime.utcnow()
    monkeypatch.setattr(billing.settings, "lemonsqueezy_store_id", "store")
    monkeypatch.setattr(billing.settings, "lemonsqueezy_variant_micro", "micro-variant")
    billing.begin_subscription_sync(tenant.id, "checkout-1", "micro")
    tenant.billing_sync_started_at = now - timedelta(seconds=11)
    tenant.billing_sync_next_at = now - timedelta(seconds=1)
    tenant.save()
    monkeypatch.setattr(billing, "_lemonsqueezy_get", lambda path, params: {"data": []})

    first = billing.poll_pending_subscription(tenant.id, now=now)
    tenant = Tenant.get_by_id(tenant.id)
    second_due = tenant.billing_sync_next_at
    assert first == {"status": "pending", "delay": 10}
    assert tenant.billing_sync_attempts == 1
    assert second_due == now + timedelta(seconds=10)
