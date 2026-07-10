"""Unit tests for billing maintenance."""

from datetime import datetime, timedelta

from lib.ctx import billing_context as billing
from models import Tenant


def test_expire_ended_subscriptions_downgrades_paid_tenants(db):
    tenant = Tenant.create(
        name="Shop",
        subdomain="shop",
        currency="UYU",
        plan="plus",
        billing_status="active",
        billing_ends_at=datetime.utcnow() - timedelta(minutes=1),
    )

    assert billing.expire_ended_subscriptions() == 1

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

    assert billing.expire_ended_subscriptions() == 0

    tenant = Tenant.get_by_id(tenant.id)
    assert tenant.plan == "plus"
    assert tenant.billing_status == "active"
