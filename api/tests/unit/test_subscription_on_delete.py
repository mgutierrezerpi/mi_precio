"""Deleting a business must stop its charges, or it must not be deleted."""

import hashlib
import hmac
import json

import pytest

from config import settings
from lib import encode_token
from lib.ctx import billing_lifecycle
from lib.ctx.billing_common import BillingGatewayError
from models import Tenant, TenantMembership, User
from tests.conftest import subscribed_tenant


@pytest.fixture
def provider(monkeypatch):
    """Billing on, with the Lemon Squeezy call recorded instead of sent."""
    calls = []
    monkeypatch.setattr(settings, "billing_enabled", True)
    monkeypatch.setattr(
        billing_lifecycle,
        "_ls_request",
        lambda method, path, payload=None: calls.append((method, path)) or {},
    )
    return calls


def _shop(**billing):
    tenant = subscribed_tenant("Café", "cafe-baja", plan="plus")
    for key, value in {
        "billing_provider": "lemonsqueezy",
        "billing_subscription_id": "sub_1",
        "billing_status": "active",
        **billing,
    }.items():
        setattr(tenant, key, value)
    tenant.save()
    owner = User.create(email="dueno@cafe-baja.com", tenant=tenant, role="owner")
    TenantMembership.create(user=owner, tenant=tenant, role="owner")
    token = encode_token(str(owner.id), owner.email, str(tenant.id))
    return tenant, {"Authorization": f"Bearer {token}"}


def _failing_provider(monkeypatch, status):
    def fail(method, path, payload=None):
        raise BillingGatewayError("Lemon Squeezy raw secret detail", status=status)

    monkeypatch.setattr(billing_lifecycle, "_ls_request", fail)


def test_deleting_a_business_cancels_its_subscription_first(client, provider):
    tenant, auth = _shop()

    res = client.delete(f"/api/v1/tenants/{tenant.id}", headers=auth)

    assert res.status_code == 200
    assert provider == [("DELETE", "subscriptions/sub_1")]
    assert Tenant.get_or_none(Tenant.id == tenant.id) is None


def test_an_abandoned_upgrade_checkout_still_cancels_the_real_subscription(
    client, provider
):
    tenant, auth = _shop(billing_status="checkout_pending")

    client.delete(f"/api/v1/tenants/{tenant.id}", headers=auth)

    assert provider == [("DELETE", "subscriptions/sub_1")]


def test_a_provider_failure_keeps_the_business_and_hides_the_raw_error(
    client, provider, monkeypatch
):
    tenant, auth = _shop()
    _failing_provider(monkeypatch, 500)

    res = client.delete(f"/api/v1/tenants/{tenant.id}", headers=auth)

    assert res.status_code == 502
    assert "raw secret" not in res.text
    assert Tenant.get_or_none(Tenant.id == tenant.id) is not None


def test_a_subscription_already_gone_at_the_provider_does_not_block(
    client, provider, monkeypatch
):
    tenant, auth = _shop()
    _failing_provider(monkeypatch, 404)

    res = client.delete(f"/api/v1/tenants/{tenant.id}", headers=auth)

    assert res.status_code == 200
    assert Tenant.get_or_none(Tenant.id == tenant.id) is None


@pytest.mark.parametrize(
    "billing",
    [
        {"billing_status": "cancelled"},
        {"billing_status": "expired"},
        {"billing_subscription_id": None},
        {"billing_provider": "manual"},
    ],
)
def test_nothing_to_cancel_means_no_provider_call(client, provider, billing):
    tenant, auth = _shop(**billing)

    res = client.delete(f"/api/v1/tenants/{tenant.id}", headers=auth)

    assert res.status_code == 200
    assert provider == []


def test_no_provider_call_when_billing_is_disabled(client, provider, monkeypatch):
    monkeypatch.setattr(settings, "billing_enabled", False)
    tenant, auth = _shop()

    res = client.delete(f"/api/v1/tenants/{tenant.id}", headers=auth)

    assert res.status_code == 200
    assert provider == []


def test_the_webhook_of_a_deleted_business_is_acknowledged(client, monkeypatch):
    monkeypatch.setattr(settings, "lemonsqueezy_webhook_secret", "secret")
    body = json.dumps(
        {
            "meta": {
                "event_name": "subscription_cancelled",
                "custom_data": {"tenant_id": "deleted-tenant"},
            },
            "data": {"id": "sub_1", "attributes": {"status": "cancelled"}},
        }
    ).encode()
    signature = hmac.new(b"secret", body, hashlib.sha256).hexdigest()

    res = client.post(
        "/api/v1/billing/lemon-squeezy/webhook",
        content=body,
        headers={"X-Signature": signature},
    )

    assert res.status_code == 200


@pytest.mark.parametrize(
    ("path", "status"),
    [("cancellations", "active"), ("resumptions", "cancelled")],
)
def test_subscription_actions_hide_the_provider_error(
    client, provider, monkeypatch, path, status
):
    tenant, auth = _shop(billing_status=status)
    _failing_provider(monkeypatch, 500)

    res = client.post(
        f"/api/v1/billing/{path}", json={"tenant_id": tenant.id}, headers=auth
    )

    assert res.status_code == 502
    assert "raw secret" not in res.text
    assert "suscripción" in res.json()["detail"]
