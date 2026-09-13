"""PyTest fixtures for testing."""

import pytest
from fastapi.testclient import TestClient
from peewee import SqliteDatabase

from app import create_app
from lib.ctx import identity

# The one list the app itself creates, rather than a copy kept in step by hand.
# The copy had drifted by five models (Category, PageView, Order, OrderItem,
# PushSubscription): anything touching those hit "no such table" because an
# unbound model still points at the app database instead of this test one.
from models.table_registry import TABLES

# TestClient serves requests on another thread. A shared in-memory database
# keeps those request connections on the same test schema.
test_db = SqliteDatabase(
    "file:mi_precio_test?mode=memory&cache=shared",
    uri=True,
    check_same_thread=False,
)


@pytest.fixture(scope="function")
def db():
    models = TABLES
    test_db.bind(models)
    test_db.connect()
    test_db.create_tables(models)
    yield test_db
    test_db.drop_tables(models)
    test_db.close()


@pytest.fixture(scope="function")
def client(db):
    app = create_app()
    with TestClient(app) as c:
        yield c


def subscribed_tenant(name: str, subdomain: str, plan: str = "pro"):
    """A shop that has paid, i.e. one whose storefront is actually served.

    `create_tenant` puts every new signup behind the plan screen, and a gated
    tenant gets a live-list allowance of zero — its public catalog comes back
    empty no matter what it has published. Tests about what a catalog returns
    need a shop past that gate; `pro` keeps plan limits out of the way so the
    assertion under test is the only thing that can fail.
    """
    tenant = identity.create_tenant(name, subdomain)
    tenant.plan = plan
    tenant.plan_gate = False
    tenant.save()
    return tenant
