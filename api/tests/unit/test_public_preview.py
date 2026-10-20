"""The list customizer previews unpublished lists for the shop's team (M8)."""

import pytest

from lib import encode_token
from lib.ctx import identity, items, lists
from models import TenantMembership, User
from tests.conftest import subscribed_tenant


@pytest.fixture
def setup(client):
    tenant = subscribed_tenant("Café", "cafe-m8")
    draft = lists.create_list(tenant.id, "Borrador")
    items.create_item(draft.version.id, name="Espresso", price=90)
    owner = User.create(email="dueno@cafe.com", tenant=tenant, role="owner")
    TenantMembership.create(user=owner, tenant=tenant, role="owner")
    token = encode_token(str(owner.id), owner.email, str(tenant.id))
    return client, tenant, draft.price_list, token


def test_team_sees_an_unpublished_list_in_the_preview(setup):
    client, tenant, draft, token = setup
    response = client.get(
        f"/api/v1/public/{tenant.subdomain}",
        params={"list": draft.id, "preview": "true"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert [entry["name"] for entry in body["lists"]] == ["Borrador"]


@pytest.mark.parametrize("with_token, with_flag", [(False, True), (True, False)])
def test_everyone_else_still_gets_no_draft(setup, with_token, with_flag):
    client, tenant, draft, token = setup
    params = {"list": draft.id}
    if with_flag:
        params["preview"] = "true"
    headers = {"Authorization": f"Bearer {token}"} if with_token else {}
    response = client.get(
        f"/api/v1/public/{tenant.subdomain}", params=params, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["lists"] == []


def test_another_shops_team_does_not_see_the_draft(setup):
    client, tenant, draft, _ = setup
    other = identity.create_tenant("Otro", "otro-m8")
    stranger = User.create(email="otro@otro.com", tenant=other, role="owner")
    TenantMembership.create(user=stranger, tenant=other, role="owner")
    token = encode_token(str(stranger.id), stranger.email, str(other.id))
    response = client.get(
        f"/api/v1/public/{tenant.subdomain}",
        params={"list": draft.id, "preview": "true"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.json()["lists"] == []
