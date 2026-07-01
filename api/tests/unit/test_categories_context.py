"""Tests for categories context — the product cascade on rename/delete.

Product categories are free text and preserve the casing the user typed (they
are no longer canonicalized on save), so the cascade must match products
case-insensitively or it silently misses differently-cased ones.
"""

import pytest
from peewee import SqliteDatabase

from lib.ctx import identity, categories, products
from models import Category, Product, Tenant


categories_db = SqliteDatabase(":memory:")


@pytest.fixture(scope="function")
def db():
    models = [Tenant, Category, Product]
    categories_db.bind(models)
    categories_db.connect()
    categories_db.create_tables(models)
    yield categories_db
    categories_db.drop_tables(models)
    categories_db.close()


def test_rename_cascades_to_products_regardless_of_casing(db):
    tenant = identity.create_tenant("Store", "store")
    category = categories.create_category(tenant.id, name="Ferreteria")
    # Same category, three casings a user might type on the product.
    exact = products.create_product(tenant.id, name="Martillo", price=100, category="Ferreteria")
    lower = products.create_product(tenant.id, name="Clavo", price=10, category="ferreteria")
    upper = products.create_product(tenant.id, name="Tornillo", price=5, category="FERRETERIA")

    categories.update_category(category.id, name="Herramientas")

    for p in (exact, lower, upper):
        assert Product.get_by_id(p.id).category == "Herramientas"


def test_delete_clears_products_regardless_of_casing(db):
    tenant = identity.create_tenant("Store", "store")
    category = categories.create_category(tenant.id, name="Lavadero")
    a = products.create_product(tenant.id, name="Jabón", price=50, category="Lavadero")
    b = products.create_product(tenant.id, name="Balde", price=80, category="lavadero")

    categories.delete_category(category.id)

    assert Product.get_by_id(a.id).category is None
    assert Product.get_by_id(b.id).category is None


def test_cascade_does_not_touch_other_tenants(db):
    tenant = identity.create_tenant("Store", "store")
    other = identity.create_tenant("Other", "other")
    category = categories.create_category(tenant.id, name="Bebidas")
    mine = products.create_product(tenant.id, name="Agua", price=30, category="bebidas")
    theirs = products.create_product(other.id, name="Cola", price=40, category="Bebidas")

    categories.update_category(category.id, name="Líquidos")

    assert Product.get_by_id(mine.id).category == "Líquidos"
    # Same category name, different tenant: must be untouched.
    assert Product.get_by_id(theirs.id).category == "Bebidas"
