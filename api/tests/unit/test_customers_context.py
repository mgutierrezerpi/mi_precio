"""Unit tests for the customers context: CRM contacts and purchase history."""

from datetime import datetime, timedelta
from decimal import Decimal

import pytest
from peewee import SqliteDatabase

from models import Tenant, Customer, Order, OrderItem
from lib.ctx import customers

customers_db = SqliteDatabase(":memory:", pragmas={"foreign_keys": 1})


@pytest.fixture(scope="function")
def db():
    models = [Tenant, Customer, Order, OrderItem]
    customers_db.bind(models)
    customers_db.connect()
    customers_db.create_tables(models)
    yield customers_db
    customers_db.drop_tables(models)
    customers_db.close()


@pytest.fixture
def tenant(db):
    return Tenant.create(name="Lavadero", subdomain="lavadero", currency="UYU")


def test_create_and_list_customer(tenant):
    customers.create_customer(tenant.id, name="Lucía", email="l@x.com", phone="099")
    result = customers.list_customers(tenant.id)
    assert len(result) == 1
    assert result[0].name == "Lucía"
    assert result[0].orders_count == 0
    assert result[0].total_spent == Decimal(0)
    assert result[0].last_order_at is None


def test_create_order_computes_total_and_items(tenant):
    c = customers.create_customer(tenant.id, name="Martín")
    order = customers.create_order(c.id, items=[
        {"name": "Lavado", "quantity": 2, "unit_price": 150},
        {"name": "Encerado", "quantity": 1, "unit_price": 300},
    ])
    assert order.total == Decimal("600.00")
    assert OrderItem.select().where(OrderItem.order == order.id).count() == 2
    assert order.currency == "UYU"  # falls back to tenant currency


def test_customer_aggregates_reflect_orders(tenant):
    c = customers.create_customer(tenant.id, name="Carla")
    customers.create_order(c.id, items=[{"name": "A", "quantity": 1, "unit_price": 100}])
    customers.create_order(c.id, items=[{"name": "B", "quantity": 1, "unit_price": 250}])

    fetched = customers.get_customer(c.id)
    assert fetched.orders_count == 2
    assert fetched.total_spent == Decimal("350.00")
    assert fetched.last_order_at is not None


def test_list_orders_newest_first_with_items(tenant):
    c = customers.create_customer(tenant.id, name="Diego")
    customers.create_order(c.id, items=[{"name": "First", "quantity": 1, "unit_price": 10}])
    customers.create_order(c.id, items=[{"name": "Second", "quantity": 1, "unit_price": 20}])
    orders = customers.list_orders(c.id)
    assert len(orders) == 2
    assert orders[0].total == Decimal("20.00")  # newest first
    assert orders[0].items[0].name == "Second"


def test_customer_stats(tenant):
    recent = customers.create_customer(tenant.id, name="Reciente")
    customers.create_order(recent.id, items=[{"name": "x", "quantity": 1, "unit_price": 10}])

    # A recurring customer with 3 purchases.
    rec = customers.create_customer(tenant.id, name="Recurrente")
    for _ in range(3):
        customers.create_order(rec.id, items=[{"name": "x", "quantity": 1, "unit_price": 10}])

    # An old customer with an old purchase (inactive).
    old = customers.create_customer(tenant.id, name="Viejo")
    o = customers.create_order(old.id, items=[{"name": "x", "quantity": 1, "unit_price": 10}])
    Order.update(created_at=datetime.utcnow() - timedelta(days=60)).where(Order.id == o.id).execute()

    stats = customers.customer_stats(tenant.id)
    assert stats["total"] == 3
    assert stats["active"] == 2  # reciente + recurrente bought in last 30 days
    assert stats["recurring"] == 1


def test_update_order_replaces_items_and_recomputes_total(tenant):
    c = customers.create_customer(tenant.id, name="Editar")
    order = customers.create_order(c.id, items=[{"name": "A", "quantity": 1, "unit_price": 100}], reference="R-1")

    updated = customers.update_order(
        order.id,
        items=[{"name": "B", "quantity": 2, "unit_price": 150}],
        status="pending",
        reference="R-2",
    )
    assert updated.total == Decimal("300.00")
    assert updated.status == "pending"
    assert updated.reference == "R-2"
    items = list(OrderItem.select().where(OrderItem.order == order.id))
    assert len(items) == 1 and items[0].name == "B"


def test_update_order_keeps_items_when_not_provided(tenant):
    c = customers.create_customer(tenant.id, name="Solo estado")
    order = customers.create_order(c.id, items=[{"name": "A", "quantity": 1, "unit_price": 100}])
    customers.update_order(order.id, status="cancelled")
    assert OrderItem.select().where(OrderItem.order == order.id).count() == 1
    assert customers.list_orders(c.id)[0].total == Decimal("100.00")


def test_delete_customer_cascades_orders(tenant):
    c = customers.create_customer(tenant.id, name="Borrar")
    customers.create_order(c.id, items=[{"name": "x", "quantity": 1, "unit_price": 10}])
    assert customers.delete_customer(c.id) is True
    assert Order.select().count() == 0
    assert OrderItem.select().count() == 0
