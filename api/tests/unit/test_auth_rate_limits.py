"""Login codes and private-list codes can not be guessed or spammed (M16)."""

from lib.ctx import auth, customers, lists, versions
from models import AuthCode, CustomerListAccess
from tests.conftest import subscribed_tenant


def test_asking_for_codes_is_capped_per_email(client):
    for _ in range(5):
        assert (
            client.post("/api/v1/auth/codes", json={"email": "a@cafe.com"}).status_code
            == 201
        )
    res = client.post("/api/v1/auth/codes", json={"email": "a@cafe.com"})
    assert res.status_code == 429
    assert "demasiados códigos" in res.json()["detail"]


def test_wrong_codes_burn_the_code_after_five_tries(client):
    real = auth.create_code("b@cafe.com")
    wrong = "000000" if real != "000000" else "111111"
    statuses = [
        client.post(
            "/api/v1/auth/tokens", json={"email": "b@cafe.com", "code": wrong}
        ).status_code
        for _ in range(5)
    ]
    assert statuses == [400, 400, 400, 400, 429]
    assert AuthCode.select().where(AuthCode.email == "b@cafe.com").count() == 0
    # Even the right code is refused now: it no longer exists.
    res = client.post("/api/v1/auth/tokens", json={"email": "b@cafe.com", "code": real})
    assert res.status_code == 429


def test_a_new_code_gets_fresh_tries(client):
    auth.create_code("c@cafe.com")
    for _ in range(5):
        client.post(
            "/api/v1/auth/tokens", json={"email": "c@cafe.com", "code": "999999"}
        )
    assert (
        client.post("/api/v1/auth/codes", json={"email": "c@cafe.com"}).status_code
        == 201
    )
    code = AuthCode.get(AuthCode.email == "c@cafe.com").code
    res = client.post("/api/v1/auth/tokens", json={"email": "c@cafe.com", "code": code})
    assert res.status_code == 201


def test_private_list_code_guessing_is_capped(client):
    tenant = subscribed_tenant("Mayorista", "mayorista-m16")
    customer = customers.create_customer(tenant.id, name="Acme", access_code="ACME2026")
    created = lists.create_list(tenant.id, "Acme")
    created.price_list.is_private = True
    created.price_list.save()
    lists.update_list(created.price_list.id, published=True)
    versions.update_version(created.version.id, published=True)
    CustomerListAccess.create(customer=customer, price_list=created.price_list)
    url = f"/api/v1/public/{tenant.subdomain}/lists/{created.price_list.id}/access"

    statuses = [
        client.post(url, json={"code": f"x{n:03d}"}).status_code for n in range(11)
    ]
    assert statuses == [403] * 10 + [429]
    # Once capped, not even the right code gets through for this visitor.
    assert client.post(url, json={"code": "ACME2026"}).status_code == 429
