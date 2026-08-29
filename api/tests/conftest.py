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
    Magazine,
    MagazinePage,
    Item,
    Invitation,
    Product,
    Activity,
    Customer,
    Lead,
    PublicViewer,
    PublicViewerDismissal,
    TenantMembership,
    LinkTree,
    FeatureFlag,
    FeatureFlagAssignment,
)


# TestClient serves requests on another thread. A shared in-memory database
# keeps those request connections on the same test schema.
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
        Magazine,
        MagazinePage,
        Item,
        Invitation,
        Product,
        Activity,
        Customer,
        Lead,
        PublicViewer,
        PublicViewerDismissal,
        TenantMembership,
        LinkTree,
        FeatureFlag,
        FeatureFlagAssignment,
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
