"""Tests for identity context."""

from lib.ctx import identity


def test_create_tenant(db):
    tenant = identity.create_tenant("Test Store", "test-store")

    assert tenant is not None
    assert tenant.name == "Test Store"
    assert tenant.subdomain == "test-store"


def test_create_tenant_lowercases_subdomain(db):
    tenant = identity.create_tenant("Test Store", "TEST-STORE")

    assert tenant.subdomain == "test-store"


def test_create_tenant_duplicate_subdomain_returns_none(db):
    identity.create_tenant("Store 1", "same-subdomain")
    tenant2 = identity.create_tenant("Store 2", "same-subdomain")

    assert tenant2 is None


def test_get_tenant(db):
    created = identity.create_tenant("Test Store", "test-store")
    found = identity.get_tenant(created.id)

    assert found is not None
    assert found.id == created.id


def test_get_tenant_not_found(db):
    found = identity.get_tenant("nonexistent")

    assert found is None


def test_list_tenants(db):
    identity.create_tenant("Store 1", "store-1")
    identity.create_tenant("Store 2", "store-2")

    tenants = identity.list_tenants()

    assert len(tenants) == 2


def test_find_tenant_by_subdomain(db):
    created = identity.create_tenant("Test Store", "test-store")
    found = identity.find_tenant_by_subdomain("test-store")

    assert found is not None
    assert found.id == created.id


def test_find_tenant_by_subdomain_case_insensitive(db):
    created = identity.create_tenant("Test Store", "test-store")
    found = identity.find_tenant_by_subdomain("TEST-STORE")

    assert found is not None
    assert found.id == created.id


def test_find_tenant_by_subdomain_not_found(db):
    found = identity.find_tenant_by_subdomain("nonexistent")

    assert found is None


def test_get_or_create_user_creates_new(db):
    result = identity.get_or_create_user("john@example.com")

    assert result.created is True
    assert result.user.email == "john@example.com"
    assert result.user.tenant is not None
    assert result.user.tenant.subdomain == "john"


def test_get_or_create_user_returns_existing(db):
    result1 = identity.get_or_create_user("john@example.com")
    result2 = identity.get_or_create_user("john@example.com")

    assert result1.created is True
    assert result2.created is False
    assert result1.user.id == result2.user.id


def test_get_or_create_user_handles_duplicate_subdomain(db):
    identity.create_tenant("Existing", "john")
    result = identity.get_or_create_user("john@example.com")

    assert result.user.tenant.subdomain == "john-1"
