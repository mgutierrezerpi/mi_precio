"""Unit tests for the notifications context: per-user feed from tenant activity."""

import pytest
from peewee import SqliteDatabase

from models import Tenant, User, Activity
from lib.ctx import notifications, activity

notif_db = SqliteDatabase(":memory:")


@pytest.fixture(scope="function")
def db():
    models = [Tenant, User, Activity]
    notif_db.bind(models)
    notif_db.connect()
    notif_db.create_tables(models)
    yield notif_db
    notif_db.drop_tables(models)
    notif_db.close()


@pytest.fixture
def tenant(db):
    return Tenant.create(name="Shop", subdomain="shop", currency="UYU")


@pytest.fixture
def user(tenant):
    return User.create(email="owner@shop.com", tenant=tenant, role="owner")


def _seed(tenant):
    for action, summary in [
        ("order.created", "Venta"),
        ("product.created", "Producto"),
        ("customer.created", "Cliente"),
        ("member.invited", "Invitó"),
        ("list.published", "Lista"),
        ("tenant.updated", "Cambió ajustes"),  # uncategorized -> never shown
    ]:
        activity.record(tenant.id, action, summary, actor="x", actor_id="zz")


def test_default_prefs_include_all_categorized_activity(tenant, user):
    _seed(tenant)
    res = notifications.list_notifications(tenant.id, user.id)
    assert len(res["items"]) == 5  # the uncategorized one is excluded
    assert res["unread"] == 5
    assert res["prefs"] == {"sales": True, "catalog": True, "customers": True, "team": True}


def test_prefs_filter_categories(tenant, user):
    _seed(tenant)
    notifications.update_prefs(user.id, {"catalog": False, "team": False})
    res = notifications.list_notifications(tenant.id, user.id)
    cats = {notifications.ACTION_CATEGORY[a.action] for a in res["items"]}
    assert cats == {"sales", "customers"}
    assert res["unread"] == 2


def test_mark_seen_clears_unread_then_new_activity_increments(tenant, user):
    _seed(tenant)
    notifications.mark_seen(user.id)
    assert notifications.list_notifications(tenant.id, user.id)["unread"] == 0
    activity.record(tenant.id, "order.created", "Otra venta", actor="x", actor_id="zz")
    assert notifications.list_notifications(tenant.id, user.id)["unread"] == 1


def test_update_prefs_persists_and_merges(tenant, user):
    notifications.update_prefs(user.id, {"sales": False})
    prefs = notifications.get_prefs(user.id)
    assert prefs == {"sales": False, "catalog": True, "customers": True, "team": True}
    # partial update keeps the previously-disabled category
    notifications.update_prefs(user.id, {"customers": False})
    assert notifications.get_prefs(user.id) == {"sales": False, "catalog": True, "customers": False, "team": True}
