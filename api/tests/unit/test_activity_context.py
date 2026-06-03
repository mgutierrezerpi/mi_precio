"""Unit tests for the activity context (tenant activity feed)."""

import pytest
from peewee import SqliteDatabase

from models import Tenant, Activity
from lib.ctx import activity

activity_db = SqliteDatabase(":memory:")


@pytest.fixture(scope="function")
def db():
    models = [Tenant, Activity]
    activity_db.bind(models)
    activity_db.connect()
    activity_db.create_tables(models)
    yield activity_db
    activity_db.drop_tables(models)
    activity_db.close()


@pytest.fixture
def tenant(db):
    return Tenant.create(name="Lavadero", subdomain="lavadero", currency="UYU")


def test_record_creates_entry(tenant):
    a = activity.record(tenant.id, "product.created", "Agregó el producto «X»", actor="ana@x.com")
    assert a is not None
    assert a.action == "product.created"
    assert a.actor == "ana@x.com"


def test_record_unknown_tenant_returns_none(db):
    assert activity.record("nope", "x", "y") is None
    assert Activity.select().count() == 0


def test_list_activity_newest_first_and_limited(tenant):
    for i in range(25):
        activity.record(tenant.id, "product.created", f"item {i}")
    items = activity.list_activity(tenant.id, limit=20)
    assert len(items) == 20
    # Newest first: the last recorded should be at the top.
    assert items[0].summary == "item 24"
