"""A shop's public pages speak the language chosen in its Settings."""

import pytest

from lib.ctx import customers, items, lists, versions
from models import CustomerListAccess
from tests.conftest import subscribed_tenant


def published_list(tenant, private=False):
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Espresso", price=90)
    if private:
        created.price_list.is_private = True
        created.price_list.save()
    lists.update_list(created.price_list.id, published=True)
    versions.update_version(created.version.id, published=True)
    return created.price_list


@pytest.mark.parametrize("language", ["es", "en", "pt"])
def test_public_menu_sends_the_shops_language(client, language):
    tenant = subscribed_tenant("Cafe", f"cafe-{language}")
    tenant.language = language
    tenant.save()
    published_list(tenant)

    response = client.get(f"/api/v1/public/{tenant.subdomain}")

    assert response.status_code == 200
    assert response.json()["tenant"]["language"] == language


def test_public_menu_falls_back_to_spanish_without_a_language(client):
    tenant = subscribed_tenant("Cafe", "cafe-blank")
    tenant.language = ""
    tenant.save()
    published_list(tenant)

    response = client.get(f"/api/v1/public/{tenant.subdomain}")

    assert response.json()["tenant"]["language"] == "es"


def test_private_list_refusal_says_which_language_to_ask_in(client):
    tenant = subscribed_tenant("Wholesale", "wholesale-en")
    tenant.language = "en"
    tenant.save()
    private = published_list(tenant, private=True)
    customer = customers.create_customer(
        tenant.id, name="Acme", access_code="ACME2026"
    )
    CustomerListAccess.create(customer=customer, price_list=private)

    response = client.get(
        f"/api/v1/public/{tenant.subdomain}", params={"list": private.id}
    )

    assert response.status_code == 403
    # Only the language: the prompt must not leak the shop's catalog data.
    assert response.json() == {"detail": "Access code required", "language": "en"}
