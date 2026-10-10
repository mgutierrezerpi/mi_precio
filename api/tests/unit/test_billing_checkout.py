"""Hosted checkout behavior for the app-managed trial."""

import json

from lib.ctx import billing_checkout
from models import Tenant


class _Response:
    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return None

    def read(self):
        return json.dumps(
            {
                "data": {
                    "id": "checkout-1",
                    "attributes": {"url": "https://example.com/checkout"},
                }
            }
        ).encode()


def test_checkout_skips_provider_trial(monkeypatch, db):
    tenant = Tenant.create(name="Shop", subdomain="shop")
    monkeypatch.setattr(billing_checkout.settings, "lemonsqueezy_api_key", "key")
    monkeypatch.setattr(billing_checkout.settings, "lemonsqueezy_store_id", "1")
    monkeypatch.setattr(billing_checkout.settings, "lemonsqueezy_variant_pro", "123")
    captured = {}

    def open_checkout(req, timeout):
        captured.update(json.loads(req.data.decode()))
        assert timeout == 10
        return _Response()

    monkeypatch.setattr(billing_checkout.request, "urlopen", open_checkout)

    result = billing_checkout.create_checkout(tenant.id, "pro")

    assert result["checkout_id"] == "checkout-1"
    assert captured["data"]["attributes"]["checkout_options"]["skip_trial"] is True
