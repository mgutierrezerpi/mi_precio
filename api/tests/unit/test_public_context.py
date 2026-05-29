"""Tests for public context."""

from lib.ctx import lists, versions, items, public, identity


def test_get_tenant_by_subdomain(db):
    tenant = identity.create_tenant("Test Store", "test-store")

    found = public.get_tenant_by_subdomain("test-store")

    assert found is not None
    assert found.id == tenant.id


def test_get_tenant_by_subdomain_not_found(db):
    found = public.get_tenant_by_subdomain("nonexistent")

    assert found is None


def test_get_published_lists(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Pizza", price=150.0)
    lists.update_list(created.price_list.id, published=True)
    versions.update_version(created.version.id, published=True)

    result = public.get_published_lists(tenant)

    assert len(result) == 1
    assert result[0].price_list.id == created.price_list.id
    assert result[0].version.id == created.version.id
    assert len(result[0].items) == 1


def test_get_published_lists_excludes_unpublished(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Pizza", price=150.0)

    result = public.get_published_lists(tenant)

    assert len(result) == 0
