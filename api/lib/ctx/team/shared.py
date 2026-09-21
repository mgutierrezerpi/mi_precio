"""Shared validation and membership compatibility for team operations."""

from models import TenantMembership, User

ASSIGNABLE_ROLES = ("admin", "editor", "viewer")


class TeamError(Exception):
    """Raised for invalid team operations; controllers map it to HTTP 400."""


def ensure_tenant_memberships(tenant_id: str) -> None:
    """Keep direct/unit-created legacy users compatible with memberships."""
    for user in User.select().where(User.tenant == tenant_id):
        TenantMembership.get_or_create(
            user=user, tenant=tenant_id, defaults={"role": user.role or "owner"}
        )
