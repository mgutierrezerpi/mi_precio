"""Tests for lists context."""

from lib.ctx import lists, identity


def test_create_list(db):
    tenant = identity.create_tenant("Test Store", "test_store")
    result = lists.create_list(tenant.id, "Menu")

    assert result is not None
    assert result.price_list.name == "Menu"
    assert result.price_list.slug == "menu"
    assert result.version.name == "v1"
    assert result.version.version_number == 1


def test_create_list_invalid_tenant(db):
    result = lists.create_list("nonexistent", "Menu")

    assert result is None


def test_get_list(db):
    tenant = identity.create_tenant("Test Store", "test_store")
    result = lists.create_list(tenant.id, "Menu")

    found = lists.get_list(result.price_list.id)

    assert found is not None
    assert found.name == "Menu"


def test_get_list_not_found(db):
    found = lists.get_list("nonexistent")

    assert found is None


def test_list_lists(db):
    tenant = identity.create_tenant("Test Store", "test_store")
    lists.create_list(tenant.id, "Menu 1")
    lists.create_list(tenant.id, "Menu 2")

    result = lists.list_lists(tenant.id)

    assert len(result) == 2


def test_update_list(db):
    tenant = identity.create_tenant("Test Store", "test_store")
    created = lists.create_list(tenant.id, "Menu")

    updated = lists.update_list(created.price_list.id, name="New Name", published=True)

    assert updated.name == "New Name"
    assert updated.slug == "new_name"
    assert updated.published is True


def test_create_list_uses_unique_slug(db):
    tenant = identity.create_tenant("Test Store", "test_store")

    first = lists.create_list(tenant.id, "Lunch Menu")
    second = lists.create_list(tenant.id, "Lunch Menu")

    assert first.price_list.slug == "lunch_menu"
    assert second.price_list.slug == "lunch_menu_2"


def test_update_list_not_found(db):
    updated = lists.update_list("nonexistent", name="New Name")

    assert updated is None


def test_delete_list(db):
    tenant = identity.create_tenant("Test Store", "test_store")
    created = lists.create_list(tenant.id, "Menu")

    result = lists.delete_list(created.price_list.id)

    assert result is True
    assert lists.get_list(created.price_list.id) is None


def test_delete_list_not_found(db):
    result = lists.delete_list("nonexistent")

    assert result is False
