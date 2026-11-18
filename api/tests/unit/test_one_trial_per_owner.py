"""N18: the app trial is one per owner, however many businesses they open."""

from datetime import timedelta

from lib.ctx import identity, plans
from models import Invitation, Tenant, TenantMembership, User
from models.base import utc_now
from models.schema_maintenance import backfill_trial_usage


def _signup(email="owner@example.com"):
    return identity.get_or_create_user(email).user


def test_a_new_signup_gets_the_trial_and_spends_it(db):
    user = _signup()

    assert plans.trial_active(user.tenant)
    assert User.get_by_id(user.id).trial_used_at == user.tenant.trial_started_at


def test_an_additional_business_starts_without_trial_on_the_plan_screen(db):
    user = _signup()

    second = identity.create_tenant("Segundo", "segundo", user.id)

    assert second.trial_started_at is None
    assert second.trial_ends_at is None
    assert second.plan_gate is True
    assert plans.plan_required(second.id)
    assert plans.plan_info(second.id)["plan"] == "free"
    assert identity.membership(user.id, second.id).role == "owner"


def test_an_additional_business_leaves_the_running_trial_alone(db):
    user = _signup()
    ends_at = user.tenant.trial_ends_at

    identity.create_tenant("Segundo", "segundo", user.id)

    first = Tenant.get_by_id(user.tenant_id)
    assert first.trial_ends_at == ends_at
    assert plans.trial_active(first)


def test_deleting_the_business_with_the_trial_does_not_renew_it(db):
    user = _signup()
    second = identity.create_tenant("Segundo", "segundo", user.id)

    identity.delete_tenant(user.tenant_id)
    third = identity.create_tenant("Tercero", "tercero", user.id)

    assert User.get_by_id(user.id).tenant_id == second.id
    assert third.trial_ends_at is None
    assert plans.plan_required(third.id)


def test_a_rejected_business_does_not_spend_the_trial(db):
    host = Tenant.create(name="Equipo", subdomain="equipo")
    member = User.create(email="member@example.com", tenant=host, role="editor")

    assert identity.create_tenant("Equipo", "equipo", member.id) is None

    assert User.get_by_id(member.id).trial_used_at is None


def test_an_invited_member_gets_a_trial_on_their_own_first_business(db):
    host = Tenant.create(name="Equipo", subdomain="equipo")
    Invitation.create(
        tenant=host, email="member@example.com", role="editor", status="pending"
    )
    member = identity.get_or_create_user("member@example.com").user

    own = identity.create_tenant("Propio", "propio", member.id)
    another = identity.create_tenant("Otro", "otro", member.id)

    assert plans.trial_active(own)
    assert another.trial_ends_at is None


def test_backfill_counts_trials_given_before_the_column_existed(db):
    now = utc_now()
    first = Tenant.create(
        name="Primero",
        subdomain="primero",
        plan_gate=True,
        trial_started_at=now - timedelta(days=9),
        trial_ends_at=now + timedelta(days=5),
    )
    second = Tenant.create(
        name="Segundo",
        subdomain="segundo",
        plan_gate=True,
        trial_started_at=now - timedelta(days=2),
        trial_ends_at=now + timedelta(days=12),
    )
    owner = User.create(email="owner@example.com", tenant=first, role="owner")
    TenantMembership.create(user=owner, tenant=first, role="owner")
    TenantMembership.create(user=owner, tenant=second, role="owner")
    editor = User.create(email="editor@example.com", tenant=first, role="editor")
    TenantMembership.create(user=editor, tenant=first, role="editor")

    backfill_trial_usage()

    assert User.get_by_id(owner.id).trial_used_at == first.trial_started_at
    # Working on someone else's trial does not spend your own.
    assert User.get_by_id(editor.id).trial_used_at is None
    # Both trials already running stay exactly as they were.
    assert Tenant.get_by_id(first.id).trial_ends_at == first.trial_ends_at
    assert Tenant.get_by_id(second.id).trial_ends_at == second.trial_ends_at
    assert identity.create_tenant("Tercero", "tercero", owner.id).trial_ends_at is None
