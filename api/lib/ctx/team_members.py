"""Team-member queries and aggregate statistics."""

from datetime import UTC, datetime, timedelta

from peewee import Case

from lib.ctx.team_shared import ensure_tenant_memberships
from models import Invitation, TenantMembership, User

ACTIVE_WINDOW_DAYS = 14


def list_members(tenant_id: str) -> list[User]:
    """All users of a tenant, owner first then by join date."""
    ensure_tenant_memberships(tenant_id)
    role_rank = Case(
        None,
        [
            (TenantMembership.role == "owner", 0),
            (TenantMembership.role == "admin", 1),
            (TenantMembership.role == "editor", 2),
        ],
        3,
    )
    members = list(
        User.select()
        .join(TenantMembership)
        .where(TenantMembership.tenant == tenant_id)
        .order_by(role_rank, User.created_at.asc())
    )
    roles = {
        membership.user_id: membership.role
        for membership in TenantMembership.select().where(
            TenantMembership.tenant == tenant_id
        )
    }
    for member in members:
        member._team_role = roles.get(member.id, member.role or "owner")
    return members


def member_stats(tenant_id: str) -> dict:
    """KPI counts for the team screen."""
    cutoff = datetime.now(UTC).replace(tzinfo=None) - timedelta(days=ACTIVE_WINDOW_DAYS)
    members = list(User.select().where(User.tenant == tenant_id))
    active = sum(member.last_seen_at >= cutoff for member in members if member.last_seen_at)
    pending = Invitation.select().where(
        Invitation.tenant == tenant_id, Invitation.status == "pending"
    ).count()
    return {
        "members": len(members),
        "active": active,
        "pending": pending,
        "roles": len({member.role for member in members}),
    }
