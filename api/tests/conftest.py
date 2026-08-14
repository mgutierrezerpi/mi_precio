"""PyTest fixtures for testing."""

import pytest
from fastapi.testclient import TestClient
from peewee import SqliteDatabase

from app import create_app
from models import (
    Tenant,
    User,
    AuthCode,
    PriceList,
    ListVersion,
    Item,
    Invitation,
    Product,
    Activity,
    Customer,
    Lead,
    TenantMembership,
)


# Shared-cache rather than a plain ":memory:": TestClient serves requests on
# another thread, and a plain in-memory database is per *connection*, so the
# app would open a second, empty one and every query would fail on a missing
# table. With a shared cache every connection in the process sees the same
# database, which is what lets tests exercise real endpoints.
test_db = SqliteDatabase(
    "file:mi_precio_test?mode=memory&cache=shared",
    uri=True,
    check_same_thread=False,
)


@pytest.fixture(scope="function")
def db():
    models = [
        Tenant,
        User,
        AuthCode,
        PriceList,
        ListVersion,
        Item,
        Invitation,
        Product,
        Activity,
        Customer,
        Lead,
        TenantMembership,
    ]
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
