"""Resource-level tenant ownership guards (controllers/ownership.py).

These protect the /lists/{id}, /items/{id}, /customers/{id}, ... endpoints that
the path-based isolation middleware can't reach. A guard must return the row for
its owner and raise 404 for anyone else (404, not 403, to avoid leaking the id)."""

import pytest
from fastapi import HTTPException
from peewee import SqliteDatabase

from models import Tenant, PriceList, ListVersion, Item, Category, Customer, Order, Product
from controllers import ownership

own_db = SqliteDatabase(":memory:")
MODELS = [Tenant, PriceList, ListVersion, Item, Category, Customer, Order, Product]


@pytest.fixture(scope="function")
def db():
    own_db.bind(MODELS)
    own_db.connect()
    own_db.create_tables(MODELS)
    yield own_db
    own_db.drop_tables(MODELS)
    own_db.close()


@pytest.fixture
def tenants(db):
    a = Tenant.create(name="A", subdomain="a", currency="UYU")
    b = Tenant.create(name="B", subdomain="b", currency="UYU")
    return a, b


def _user(tenant):
    return {"tenant_id": tenant.id}


def test_direct_models_owner_ok_other_404(tenants):
    a, b = tenants
    rows = {
        ownership.own_product: Product.create(tenant=a, name="P", price=1),
        ownership.own_customer: Customer.create(tenant=a, name="C"),
        ownership.own_category: Category.create(tenant=a, name="Cat"),
        ownership.own_order: Order.create(tenant=a, customer=Customer.create(tenant=a, name="C2")),
    }
    for guard, row in rows.items():
        assert guard(row.id, _user(a)).id == row.id           # owner gets it back
        with pytest.raises(HTTPException) as exc:
            guard(row.id, _user(b))                            # other tenant blocked
        assert exc.value.status_code == 404


def test_nested_version_and_item_resolve_tenant_through_parents(tenants):
    a, b = tenants
    plist = PriceList.create(tenant=a, name="L")
    version = ListVersion.create(list=plist, name="v1")
    item = Item.create(list_version=version, name="I", price=5)

    assert ownership.own_list(plist.id, _user(a)).id == plist.id
    assert ownership.own_version(version.id, _user(a)).id == version.id
    assert ownership.own_item(item.id, _user(a)).id == item.id

    for guard, rid in [(ownership.own_list, plist.id),
                       (ownership.own_version, version.id),
                       (ownership.own_item, item.id)]:
        with pytest.raises(HTTPException) as exc:
            guard(rid, _user(b))
        assert exc.value.status_code == 404


def test_missing_id_is_404(tenants):
    a, _ = tenants
    with pytest.raises(HTTPException) as exc:
        ownership.own_product("does-not-exist", _user(a))
    assert exc.value.status_code == 404
