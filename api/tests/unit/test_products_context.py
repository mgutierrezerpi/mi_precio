"""Tests for products context."""

from decimal import Decimal

import pytest
from peewee import SqliteDatabase

from lib.ctx import identity, items, lists, products
from models import Item, ListVersion, PriceList, Product, Tenant


products_db = SqliteDatabase(":memory:")


@pytest.fixture(scope="function")
def db():
    models = [Tenant, PriceList, ListVersion, Item, Product]
    products_db.bind(models)
    products_db.connect()
    products_db.create_tables(models)
    yield products_db
    products_db.drop_tables(models)
    products_db.close()


def test_update_product_price_updates_matching_items_in_tenant_lists(db):
    tenant = identity.create_tenant("Test Store", "test_store")
    other_tenant = identity.create_tenant("Other Store", "other_store")
    product = products.create_product(tenant.id, name="Pizza", price=150)
    first_list = lists.create_list(tenant.id, "Lunch")
    second_list = lists.create_list(tenant.id, "Dinner")
    other_list = lists.create_list(other_tenant.id, "Other")

    first_item = items.create_item(first_list.version.id, name="Pizza", price=150)
    second_item = items.create_item(second_list.version.id, name="Pizza", price=150)
    custom_item = items.create_item(second_list.version.id, name="Big Pizza", price=180)
    other_item = items.create_item(other_list.version.id, name="Pizza", price=150)

    products.update_product(product.id, price=200)

    first_item = Item.get_by_id(first_item.id)
    second_item = Item.get_by_id(second_item.id)
    custom_item = Item.get_by_id(custom_item.id)
    other_item = Item.get_by_id(other_item.id)
    assert first_item.price == Decimal("200.00")
    assert second_item.price == Decimal("200.00")
    assert custom_item.price == Decimal("180.00")
    assert other_item.price == Decimal("150.00")


def test_update_product_without_price_does_not_update_item_prices(db):
    tenant = identity.create_tenant("Test Store", "test_store")
    product = products.create_product(tenant.id, name="Pizza", price=150)
    created = lists.create_list(tenant.id, "Lunch")
    item = items.create_item(created.version.id, name="Pizza", price=150)

    products.update_product(product.id, description="New description")

    item = Item.get_by_id(item.id)
    assert item.price == Decimal("150.00")


def test_update_product_price_can_target_selected_lists(db):
    tenant = identity.create_tenant("Test Store", "test_store")
    product = products.create_product(tenant.id, name="Pizza", price=150)
    first_list = lists.create_list(tenant.id, "Lunch")
    second_list = lists.create_list(tenant.id, "Dinner")
    first_item = items.create_item(first_list.version.id, name="Pizza", price=150)
    second_item = items.create_item(second_list.version.id, name="Pizza", price=150)

    products.update_product(product.id, price=200, price_list_ids=[first_list.price_list.id])

    first_item = Item.get_by_id(first_item.id)
    second_item = Item.get_by_id(second_item.id)
    assert first_item.price == Decimal("200.00")
    assert second_item.price == Decimal("150.00")


def test_update_product_price_can_skip_all_lists(db):
    tenant = identity.create_tenant("Test Store", "test_store")
    product = products.create_product(tenant.id, name="Pizza", price=150)
    created = lists.create_list(tenant.id, "Lunch")
    item = items.create_item(created.version.id, name="Pizza", price=150)

    products.update_product(product.id, price=200, price_list_ids=[])

    product = Product.get_by_id(product.id)
    item = Item.get_by_id(item.id)
    assert product.price == Decimal("200.00")
    assert item.price == Decimal("150.00")
