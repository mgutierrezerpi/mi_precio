"""Team invitation queries and mutations."""

from lib.ctx.team_shared import ASSIGNABLE_ROLES, TeamError, ensure_tenant_memberships
from models import Invitation, Tenant, TenantMembership, User


def list_invitations(tenant_id: str) -> list[Invitation]:
    """Pending invitations for a tenant, newest first."""
    return list(
        Invitation.select()
        .where(Invitation.tenant == tenant_id, Invitation.status == "pending")
        .order_by(Invitation.created_at.desc())
    )


def invite_member(tenant_id: str, email: str, role: str) -> Invitation:
    """Create a pending invitation, rejecting invalid or conflicting emails."""
    email = (email or "").strip().lower()
    if "@" not in email:
        raise TeamError("Email inválido")
    if role not in ASSIGNABLE_ROLES:
        raise TeamError("Rol inválido")

    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        raise TeamError("Cuenta no encontrada")
    ensure_tenant_memberships(tenant_id)

    existing = User.get_or_none(User.email == email)
    if existing and TenantMembership.get_or_none(user=existing, tenant=tenant):
        raise TeamError("Esa persona ya es parte del equipo")

    pending = Invitation.get_or_none(
        (Invitation.email == email) & (Invitation.status == "pending")
    )
    if pending:
        if pending.tenant_id == tenant_id:
            raise TeamError("Ya hay una invitación pendiente para ese email")
        raise TeamError("Ese email tiene una invitación pendiente en otra cuenta")

    return Invitation.create(tenant=tenant, email=email, role=role, status="pending")


def cancel_invitation(tenant_id: str, invitation_id: str) -> bool:
    """Revoke a pending invitation. Returns False if it doesn't exist."""
    invite = Invitation.get_or_none(
        Invitation.id == invitation_id, Invitation.tenant == tenant_id
    )
    if not invite:
        return False
    invite.delete_instance()
    return True
