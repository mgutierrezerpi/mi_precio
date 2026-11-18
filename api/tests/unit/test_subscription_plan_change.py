"""A paying customer changes plan on their subscription, never on a second one."""

import pytest

from config import settings
from lib import encode_token
from lib.ctx import billing_checkout, billing_lifecycle
from lib.ctx import billing_context as billing
from lib.ctx.billing_common import BillingGatewayError
from models import Tenant, TenantMembership, User
from tests.conftest import subscribed_tenant


@pytest.fixture
def provider(monkeypatch):
    """Billing on, answering each PATCH the way Lemon Squeezy does."""
    calls = []

    def respond(method, path, payload=None):
        calls.append((method, path, payload))
        attributes = payload["data"]["attributes"]
        return {
            "data": {
                "attributes": {
                    "status": "active",
                    "variant_id": attributes["variant_id"],
                    "customer_id": 7,
                    "renews_at": "2026-12-10T12:00:00Z",
                    "ends_at": None,
                }
            }
        }

    monkeypatch.setattr(settings, "billing_enabled", True)
    monkeypatch.setattr(settings, "lemonsqueezy_api_key", "key")
    monkeypatch.setattr(settings, "lemonsqueezy_store_id", "1")
    monkeypatch.setattr(settings, "lemonsqueezy_variant_micro", "101")
    monkeypatch.setattr(settings, "lemonsqueezy_variant_plus", "102")
    monkeypatch.setattr(settings, "lemonsqueezy_variant_pro", "103")
    monkeypatch.setattr(billing_lifecycle, "_ls_request", respond)
    return calls


def _shop(role="owner", **billing_fields):
    tenant = subscribed_tenant("Café", "cafe-cambio", plan="plus")
    for key, value in {
        "billing_provider": "lemonsqueezy",
        "billing_subscription_id": "sub_1",
        "billing_status": "active",
        **billing_fields,
    }.items():
        setattr(tenant, key, value)
    tenant.save()
    user = User.create(email="dueno@cafe-cambio.com", tenant=tenant, role=role)
    TenantMembership.create(user=user, tenant=tenant, role=role)
    token = encode_token(str(user.id), user.email, str(tenant.id), role=role)
    return tenant, {"Authorization": f"Bearer {token}"}


def _change(client, tenant, auth, plan="pro"):
    return client.post(
        "/api/v1/billing/plan-changes",
        json={"tenant_id": tenant.id, "plan": plan},
        headers=auth,
    )


def test_changing_plan_moves_the_existing_subscription(client, provider):
    tenant, auth = _shop()

    res = _change(client, tenant, auth)

    assert res.status_code == 200
    method, path, payload = provider[0]
    assert (method, path) == ("PATCH", "subscriptions/sub_1")
    assert payload["data"]["attributes"] == {"variant_id": 103}
    tenant = Tenant.get_by_id(tenant.id)
    assert tenant.plan == "pro"
    assert tenant.billing_subscription_id == "sub_1"


def test_choosing_a_plan_during_the_grace_period_resumes_it(client, provider):
    tenant, auth = _shop(billing_status="cancelled")

    assert _change(client, tenant, auth).status_code == 200

    assert provider[0][2]["data"]["attributes"] == {
        "variant_id": 103,
        "cancelled": False,
    }
    assert Tenant.get_by_id(tenant.id).billing_status == "active"


def test_a_second_checkout_is_refused_for_a_paying_customer(client, provider):
    tenant, auth = _shop()

    res = client.post(
        "/api/v1/billing/checkouts",
        json={"tenant_id": tenant.id, "plan": "pro"},
        headers=auth,
    )

    assert res.status_code == 400
    assert "suscripción activa" in res.json()["detail"]
    assert Tenant.get_by_id(tenant.id).billing_status == "active"


@pytest.mark.parametrize(
    "fields",
    [
        {"billing_status": "expired", "plan": "free"},
        {"billing_status": None, "billing_subscription_id": None, "plan": "free"},
        {"billing_provider": "manual"},
    ],
)
def test_customers_without_a_live_subscription_still_get_a_checkout(
    db, provider, monkeypatch, fields
):
    tenant, _ = _shop(**fields)

    class Response:
        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def read(self):
            return b'{"data": {"id": "c1", "attributes": {"url": "https://pay"}}}'

    monkeypatch.setattr(billing_checkout.request, "urlopen", lambda *a, **k: Response())

    assert billing.create_checkout(tenant.id, "pro")["url"] == "https://pay"


def test_an_expired_subscription_cannot_be_moved(client, provider):
    tenant, auth = _shop(billing_status="expired")

    res = _change(client, tenant, auth)

    assert res.status_code == 400
    assert provider == []


def test_the_current_plan_is_not_sent_to_the_provider(client, provider):
    tenant, auth = _shop()

    assert _change(client, tenant, auth, plan="plus").status_code == 400
    assert provider == []


def test_a_free_plan_is_not_a_plan_change(client, provider):
    tenant, auth = _shop()

    assert _change(client, tenant, auth, plan="free").status_code == 400
    assert provider == []


def test_a_provider_failure_keeps_the_plan_and_hides_the_raw_error(
    client, provider, monkeypatch
):
    tenant, auth = _shop()

    def fail(method, path, payload=None):
        raise BillingGatewayError("Lemon Squeezy raw secret detail", status=500)

    monkeypatch.setattr(billing_lifecycle, "_ls_request", fail)

    res = _change(client, tenant, auth)

    assert res.status_code == 502
    assert "raw secret" not in res.text
    assert Tenant.get_by_id(tenant.id).plan == "plus"


def test_only_the_owner_can_change_the_plan(client, provider):
    tenant, auth = _shop(role="editor")

    assert _change(client, tenant, auth).status_code == 403
    assert provider == []


@pytest.mark.parametrize("status", ["cancelled", "expired"])
def test_the_end_of_a_replaced_subscription_does_not_touch_the_plan(db, status):
    tenant, _ = _shop(billing_subscription_id="sub_new")

    result = billing.sync_subscription_from_attributes(
        {"id": "sub_old", "status": status, "variant_id": 102}, tenant_id=tenant.id
    )

    assert result is None
    tenant = Tenant.get_by_id(tenant.id)
    assert tenant.plan == "plus"
    assert tenant.billing_status == "active"
    assert tenant.billing_subscription_id == "sub_new"


def test_the_end_of_the_current_subscription_still_applies(db):
    tenant, _ = _shop()

    billing.sync_subscription_from_attributes(
        {"id": "sub_1", "status": "expired", "variant_id": 102}, tenant_id=tenant.id
    )

    tenant = Tenant.get_by_id(tenant.id)
    assert tenant.plan == "free"
    assert tenant.billing_status == "expired"


def test_a_new_subscription_replaces_an_ended_one(db):
    tenant, _ = _shop(billing_status="expired", plan="free")

    billing.sync_subscription_from_attributes(
        {"id": "sub_2", "status": "active", "variant_id": 102}, tenant_id=tenant.id
    )

    assert Tenant.get_by_id(tenant.id).billing_subscription_id == "sub_2"
