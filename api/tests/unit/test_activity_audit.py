"""The audit log records what shops change, once per real change (M11)."""

import pytest

from lib import encode_token
from lib.ctx import activity, lists, products
from models import Activity, TenantMembership, User
from tests.conftest import subscribed_tenant


@pytest.fixture
def shop(client):
    tenant = subscribed_tenant("Café", "cafe-m11")
    owner = User.create(email="dueno@cafe.com", tenant=tenant, role="owner")
    TenantMembership.create(user=owner, tenant=tenant, role="owner")
    token = encode_token(str(owner.id), owner.email, str(tenant.id))
    return client, tenant, {"Authorization": f"Bearer {token}"}


def actions(tenant):
    return [
        a.action
        for a in Activity.select()
        .where(Activity.tenant == tenant.id)
        .order_by(Activity.created_at, Activity.id)
    ]


def test_saving_a_published_list_again_is_not_a_new_publication(shop):
    client, tenant, auth = shop
    created = lists.create_list(tenant.id, "Menú")
    url = f"/api/v1/lists/{created.price_list.id}"
    for _ in range(3):
        assert (
            client.patch(url, json={"published": True}, headers=auth).status_code == 200
        )
    assert actions(tenant).count("list.published") == 1


def test_price_change_is_logged_with_both_amounts(shop):
    client, tenant, auth = shop
    product = products.create_product(tenant.id, name="Espresso", price=90)
    client.patch(f"/api/v1/products/{product.id}", json={"price": 100}, headers=auth)
    entry = Activity.get(Activity.action == "product.price_changed")
    assert entry.summary == "Cambió el precio de «Espresso» de UYU 90 a UYU 100"


def test_other_product_edits_are_logged_once_per_session(shop):
    client, tenant, auth = shop
    product = products.create_product(tenant.id, name="Espresso", price=90)
    for text in ("Doble", "Doble shot", "Doble shot de la casa"):
        client.patch(
            f"/api/v1/products/{product.id}", json={"description": text}, headers=auth
        )
    assert actions(tenant).count("product.updated") == 1


def test_categories_are_logged(shop):
    client, tenant, auth = shop
    res = client.post(
        f"/api/v1/tenants/{tenant.id}/categories", json={"name": "Cafés"}, headers=auth
    )
    category_id = res.json()["id"]
    client.patch(
        f"/api/v1/categories/{category_id}", json={"name": "Café"}, headers=auth
    )
    client.delete(f"/api/v1/categories/{category_id}", headers=auth)
    assert actions(tenant) == [
        "category.created",
        "category.renamed",
        "category.deleted",
    ]


def test_coalescing_only_merges_the_same_edit_by_the_same_person(shop):
    _, tenant, _ = shop
    for actor in ("a", "a", "b"):
        activity.record(
            tenant.id,
            "linktree.updated",
            "Actualizó su Linktree",
            actor_id=actor,
            entity_id="tree",
            coalesce_minutes=10,
        )
    assert actions(tenant) == ["linktree.updated", "linktree.updated"]
