"""Unit tests for the auth dependency: the token alone is not enough."""

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from peewee import SqliteDatabase

from controllers.deps import get_current_user
from lib.security.tokens import encode_token
from models import Tenant, TenantMembership, User

deps_db = SqliteDatabase(":memory:")


@pytest.fixture(scope="function")
def db():
    models = [Tenant, User, TenantMembership]
    deps_db.bind(models)
    deps_db.connect()
    deps_db.create_tables(models)
    yield deps_db
    deps_db.drop_tables(models)
    deps_db.close()


@pytest.fixture
def tenant(db):
    return Tenant.create(name="Café", subdomain="cafe", currency="UYU")


@pytest.fixture
def admin(tenant):
    user = User.create(email="admin@cafe.com", tenant=tenant, role="admin")
    TenantMembership.create(user=user, tenant=tenant, role="admin")
    return user


def _credentials(user, tenant, role):
    token = encode_token(str(user.id), user.email, str(tenant.id), role)
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def test_member_with_membership_is_let_in(tenant, admin):
    payload = get_current_user(_credentials(admin, tenant, "admin"))
    assert payload["sub"] == str(admin.id)
    assert payload["role"] == "admin"


def test_removed_member_loses_access_with_old_token(tenant, admin):
    credentials = _credentials(admin, tenant, "admin")
    TenantMembership.delete().where(TenantMembership.user == admin.id).execute()
    with pytest.raises(HTTPException) as exc:
        get_current_user(credentials)
    assert exc.value.status_code == 401


def test_role_comes_from_membership_not_token(tenant, admin):
    # Token still says "admin", but the member was downgraded afterwards.
    credentials = _credentials(admin, tenant, "admin")
    TenantMembership.update(role="viewer").where(
        TenantMembership.user == admin.id
    ).execute()
    assert get_current_user(credentials)["role"] == "viewer"


def test_token_for_another_business_is_rejected(tenant, admin):
    other = Tenant.create(name="Otro", subdomain="otro", currency="UYU")
    with pytest.raises(HTTPException) as exc:
        get_current_user(_credentials(admin, other, "owner"))
    assert exc.value.status_code == 401
