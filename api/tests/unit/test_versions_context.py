"""Tests for versions context."""

from lib.ctx import lists, versions, items, identity


def test_create_version(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")

    version = versions.create_version(created.price_list.id, "v2")

    assert version is not None
    assert version.name == "v2"
    assert version.version_number == 2


def test_create_version_invalid_list(db):
    version = versions.create_version("nonexistent", "v1")

    assert version is None


def test_get_version(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")

    found = versions.get_version(created.version.id)

    assert found is not None
    assert found.name == "v1"


def test_list_versions(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    versions.create_version(created.price_list.id, "v2")

    result = versions.list_versions(created.price_list.id)

    assert len(result) == 2


def test_update_version(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")

    updated = versions.update_version(created.version.id, name="Updated", published=True)

    assert updated.name == "Updated"
    assert updated.published is True
    assert updated.published_at is not None


def test_update_version_unpublishes_others(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    v2 = versions.create_version(created.price_list.id, "v2")

    versions.update_version(created.version.id, published=True)
    versions.update_version(v2.id, published=True)

    v1_refreshed = versions.get_version(created.version.id)
    assert v1_refreshed.published is False


def test_duplicate_version(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Pizza", price=100.0)

    duplicated = versions.duplicate_version(created.version.id, "v2")

    assert duplicated is not None
    assert duplicated.name == "v2"
    assert duplicated.version_number == 2
    duplicated_items = items.list_items(duplicated.id)
    assert len(duplicated_items) == 1
    assert duplicated_items[0].name == "Pizza"


def test_duplicate_version_not_found(db):
    duplicated = versions.duplicate_version("nonexistent")

    assert duplicated is None
