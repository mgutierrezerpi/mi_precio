"""Tests for items context."""

from lib.ctx import lists, items, identity, products
from models import Item
from views import ItemView


def test_create_item(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")

    item = items.create_item(created.version.id, name="Pizza", price=150.0, description="Delicious")

    assert item is not None
    assert item.name == "Pizza"
    assert item.price == 150.0
    assert item.currency == "UYU"
    assert item.description == "Delicious"
    assert item.position == 0


def test_create_item_with_product_id_links_and_view_exposes_it(db):
    tenant = identity.create_tenant("Store", "store-fk")
    created = lists.create_list(tenant.id, "Menu")
    product = products.create_product(tenant.id, name="Pizza", price=150)

    item = items.create_item(created.version.id, name="Pizza", price=150, product_id=product.id)

    assert item.product_id == product.id
    # The view exposes the link so the list editor can match membership by id.
    view = ItemView.render(Item.get_by_id(item.id))
    assert view.product_id == product.id


def test_create_item_without_product_id_is_null(db):
    tenant = identity.create_tenant("Store", "store-fk2")
    created = lists.create_list(tenant.id, "Menu")
    item = items.create_item(created.version.id, name="Manual", price=10)
    assert item.product_id is None
    assert ItemView.render(Item.get_by_id(item.id)).product_id is None


def test_create_item_auto_increments_position(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")

    item1 = items.create_item(created.version.id, name="Pizza", price=150.0)
    item2 = items.create_item(created.version.id, name="Burger", price=120.0)

    assert item1.position == 0
    assert item2.position == 1


def test_create_item_invalid_version(db):
    item = items.create_item("nonexistent", name="Pizza", price=150.0)

    assert item is None


def test_get_item(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    item = items.create_item(created.version.id, name="Pizza", price=150.0)

    found = items.get_item(item.id)

    assert found is not None
    assert found.name == "Pizza"


def test_list_items(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Pizza", price=150.0)
    items.create_item(created.version.id, name="Burger", price=120.0)

    result = items.list_items(created.version.id)

    assert len(result) == 2


def test_list_items_ordered_by_position(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Pizza", price=150.0)
    items.create_item(created.version.id, name="Burger", price=120.0)

    result = items.list_items(created.version.id)

    assert result[0].name == "Pizza"
    assert result[1].name == "Burger"


def test_update_item(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    item = items.create_item(created.version.id, name="Pizza", price=150.0)

    updated = items.update_item(item.id, name="Big Pizza", price=200.0)

    assert updated.name == "Big Pizza"
    assert updated.price == 200.0


def test_update_item_not_found(db):
    updated = items.update_item("nonexistent", name="Pizza")

    assert updated is None


def test_delete_item(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    item = items.create_item(created.version.id, name="Pizza", price=150.0)

    result = items.delete_item(item.id)

    assert result is True
    assert items.get_item(item.id) is None


def test_delete_item_not_found(db):
    result = items.delete_item("nonexistent")

    assert result is False


def test_reorder_items(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    item1 = items.create_item(created.version.id, name="Pizza", price=150.0)
    item2 = items.create_item(created.version.id, name="Burger", price=120.0)

    items.reorder_items(created.version.id, [item2.id, item1.id])

    result = items.list_items(created.version.id)
    assert result[0].name == "Burger"
    assert result[1].name == "Pizza"
