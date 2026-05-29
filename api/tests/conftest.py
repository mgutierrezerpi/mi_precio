"""PyTest fixtures for testing."""

import pytest
from fastapi.testclient import TestClient
from peewee import SqliteDatabase

from app import create_app
from models import Tenant, User, AuthCode, PriceList, ListVersion, Item


test_db = SqliteDatabase(":memory:")


@pytest.fixture(scope="function")
def db():
    models = [Tenant, User, AuthCode, PriceList, ListVersion, Item]
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
