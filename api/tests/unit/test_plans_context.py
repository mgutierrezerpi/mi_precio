"""Unit tests for the plans context: tiers, usage and limit enforcement."""

import pytest
from peewee import SqliteDatabase

from models import Tenant, Product, PriceList, User, Invitation
from lib.ctx import plans
from lib.ctx.plans_context import PlanLimitError

plans_db = SqliteDatabase(":memory:")


@pytest.fixture(scope="function")
def db():
    models = [Tenant, Product, PriceList, User, Invitation]
    plans_db.bind(models)
    plans_db.connect()
    plans_db.create_tables(models)
    yield plans_db
    plans_db.drop_tables(models)
    plans_db.close()


@pytest.fixture
def tenant(db):
    return Tenant.create(name="Shop", subdomain="shop", currency="UYU")


def test_new_tenant_is_free(tenant):
    info = plans.plan_info(tenant.id)
    assert info["plan"] == "free"
    assert info["limits"] == {"products": 10, "lists": 1, "members": 1}
    assert info["usage"] == {"products": 0, "lists": 0, "members": 0}


def test_product_limit_enforced_on_free(tenant):
    for i in range(25):
        Product.create(tenant=tenant, name=f"P{i}", price=1)
    with pytest.raises(PlanLimitError):
        plans.assert_can_add(tenant.id, "products")


def test_member_limit_counts_users_and_pending_invites(tenant):
    User.create(email="owner@shop.com", tenant=tenant, role="owner")  # 1/1 on free
    with pytest.raises(PlanLimitError):
        plans.assert_can_add(tenant.id, "members")
    # a pending invitation also counts toward the limit
    plans.set_plan(tenant.id, "pyme")  # limit 5
    Invitation.create(tenant=tenant, email="a@shop.com", role="editor", status="pending")
    assert plans.plan_info(tenant.id)["usage"]["members"] == 2


def test_upgrade_lifts_limits(tenant):
    for i in range(25):
        Product.create(tenant=tenant, name=f"P{i}", price=1)
    plans.set_plan(tenant.id, "pyme")
    plans.assert_can_add(tenant.id, "products")  # no raise (pyme products unlimited)


def test_pro_is_unlimited(tenant):
    plans.set_plan(tenant.id, "pro")
    for i in range(50):
        Product.create(tenant=tenant, name=f"P{i}", price=1)
    plans.assert_can_add(tenant.id, "products")  # None limit → never raises


def test_set_plan_rejects_invalid(tenant):
    with pytest.raises(ValueError):
        plans.set_plan(tenant.id, "enterprise")
