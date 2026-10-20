"""Unit tests for the team context: members, roles and invitations."""

import pytest
from peewee import SqliteDatabase

from lib.ctx import identity, team
from lib.ctx.team_context import TeamError
from models import AuthCode, Invitation, Tenant, TenantMembership, User

team_db = SqliteDatabase(":memory:")


@pytest.fixture(scope="function")
def db():
    models = [Tenant, User, TenantMembership, Invitation, AuthCode]
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
    return User.create(
        email="owner@shop.com", tenant=tenant, name="Owner", role="owner"
    )


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


@pytest.fixture
def admin(tenant, owner):
    return User.create(
        email="admin@shop.com", tenant=tenant, name="Admin", role="admin"
    )


def test_admin_can_change_another_members_role(tenant, admin):
    member = User.create(
        email="m@shop.com", tenant=tenant, name="Member", role="editor"
    )
    # The client echoes the unchanged name and email along with the new role.
    updated = team.update_member(
        tenant.id, member.id, admin.id, role="viewer", name="Member", email="m@shop.com"
    )
    assert updated.role == "viewer"


def test_admin_cannot_change_owner_email(tenant, owner, admin):
    with pytest.raises(TeamError):
        team.update_member(tenant.id, owner.id, admin.id, email="attacker@x.com")
    assert User.get_by_id(owner.id).email == "owner@shop.com"


def test_admin_cannot_change_another_members_email(tenant, admin):
    member = User.create(email="m@shop.com", tenant=tenant, role="editor")
    with pytest.raises(TeamError):
        team.update_member(tenant.id, member.id, admin.id, email="attacker@x.com")
    assert User.get_by_id(member.id).email == "m@shop.com"


def test_admin_cannot_change_another_members_name(tenant, owner, admin):
    with pytest.raises(TeamError):
        team.update_member(tenant.id, owner.id, admin.id, name="Otro nombre")
    assert User.get_by_id(owner.id).name == "Owner"


def test_member_can_change_own_name(tenant, owner):
    updated = team.update_member(tenant.id, owner.id, owner.id, name="Nuevo dueño")
    assert updated.name == "Nuevo dueño"


def test_member_cannot_change_own_email_from_team(tenant, owner):
    with pytest.raises(TeamError):
        team.update_member(tenant.id, owner.id, owner.id, email="new@shop.com")
    assert User.get_by_id(owner.id).email == "owner@shop.com"


def test_owner_role_stays_locked(tenant, owner):
    with pytest.raises(TeamError):
        team.update_member(tenant.id, owner.id, owner.id, role="admin")


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


def test_role_change_in_another_business_keeps_the_legacy_role(tenant, owner):
    # `owner` signed up with `tenant`; another shop invites them as editor.
    other = Tenant.create(name="Otro", subdomain="otro", currency="UYU")
    TenantMembership.create(user=owner, tenant=other, role="editor")

    team.update_member_role(other.id, owner.id, "viewer")
    team.update_member(other.id, owner.id, None, role="editor")

    assert User.get_by_id(owner.id).role == "owner"
    assert TenantMembership.get(user=owner.id, tenant=other.id).role == "editor"


def test_role_change_in_the_primary_business_updates_the_legacy_role(tenant, owner):
    member = User.create(email="m@shop.com", tenant=tenant, role="editor")
    team.update_member(tenant.id, member.id, owner.id, role="viewer")
    assert User.get_by_id(member.id).role == "viewer"
