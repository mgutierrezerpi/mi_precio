"""Unit tests for the team context: members, roles and invitations."""

import pytest
from peewee import SqliteDatabase

from models import Tenant, User, Invitation, AuthCode
from lib.ctx import team, identity
from lib.ctx.team_context import TeamError

team_db = SqliteDatabase(":memory:")


@pytest.fixture(scope="function")
def db():
    models = [Tenant, User, Invitation, AuthCode]
    team_db.bind(models)
    team_db.connect()
    team_db.create_tables(models)
    yield team_db
    team_db.drop_tables(models)
    team_db.close()


@pytest.fixture
def tenant(db):
    return Tenant.create(name="Ferretería", subdomain="ferreteria", currency="UYU")


@pytest.fixture
def owner(tenant):
    return User.create(email="owner@shop.com", tenant=tenant, name="Owner", role="owner")


def test_invite_creates_pending_invitation(tenant, owner):
    inv = team.invite_member(tenant.id, "Editor@Shop.com", "editor")
    assert inv.email == "editor@shop.com"  # normalized to lowercase
    assert inv.role == "editor"
    assert inv.status == "pending"


def test_invite_rejects_invalid_role(tenant, owner):
    with pytest.raises(TeamError):
        team.invite_member(tenant.id, "x@shop.com", "owner")


def test_invite_rejects_existing_member(tenant, owner):
    with pytest.raises(TeamError):
        team.invite_member(tenant.id, "owner@shop.com", "editor")


def test_invite_rejects_duplicate_pending(tenant, owner):
    team.invite_member(tenant.id, "new@shop.com", "viewer")
    with pytest.raises(TeamError):
        team.invite_member(tenant.id, "new@shop.com", "viewer")


def test_invited_user_joins_tenant_on_signup(tenant, owner):
    team.invite_member(tenant.id, "joiner@shop.com", "editor")
    result = identity.get_or_create_user("joiner@shop.com")
    assert result.user.tenant_id == tenant.id
    assert result.user.role == "editor"
    assert Invitation.get(Invitation.email == "joiner@shop.com").status == "accepted"


def test_uninvited_signup_creates_own_tenant(db):
    result = identity.get_or_create_user("solo@shop.com")
    assert result.user.role == "owner"
    assert result.user.tenant.subdomain == "solo"


def test_cannot_change_owner_role(tenant, owner):
    with pytest.raises(TeamError):
        team.update_member_role(tenant.id, owner.id, "editor")


def test_cannot_remove_owner(tenant, owner):
    with pytest.raises(TeamError):
        team.remove_member(tenant.id, owner.id, acting_user_id="someone")


def test_cannot_remove_self(tenant, owner):
    member = User.create(email="m@shop.com", tenant=tenant, role="editor")
    with pytest.raises(TeamError):
        team.remove_member(tenant.id, member.id, acting_user_id=member.id)


def test_update_role_and_remove_member(tenant, owner):
    member = User.create(email="m@shop.com", tenant=tenant, role="editor")
    team.update_member_role(tenant.id, member.id, "viewer")
    assert User.get(User.id == member.id).role == "viewer"
    team.remove_member(tenant.id, member.id, acting_user_id=owner.id)
    assert User.get_or_none(User.id == member.id) is None


def test_update_member_simple_admin_ui(tenant, owner):
    member = User.create(email="m@shop.com", tenant=tenant, role="editor")
    updated = team.update_member(tenant.id, member.id, simple_admin_ui=True)
    assert updated.simple_admin_ui is True
    assert User.get(User.id == member.id).simple_admin_ui is True


def test_member_stats(tenant, owner):
    User.create(email="e@shop.com", tenant=tenant, role="editor")
    team.invite_member(tenant.id, "pending@shop.com", "viewer")
    stats = team.member_stats(tenant.id)
    assert stats["members"] == 2
    assert stats["pending"] == 1
    assert stats["roles"] == 2  # owner + editor


def test_cancel_invitation(tenant, owner):
    inv = team.invite_member(tenant.id, "p@shop.com", "viewer")
    assert team.cancel_invitation(tenant.id, inv.id) is True
    assert Invitation.get_or_none(Invitation.id == inv.id) is None
    assert team.cancel_invitation(tenant.id, "missing") is False
