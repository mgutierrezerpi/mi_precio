"""Team context - members of a tenant, their roles, and pending invitations."""

from datetime import datetime, timedelta

from peewee import Case

from models import Tenant, User, Invitation

# Roles an owner/admin may assign when inviting or editing a member (never "owner").
ASSIGNABLE_ROLES = ("admin", "editor", "viewer")
# A member counts as "active" if seen within this window.
ACTIVE_WINDOW_DAYS = 14


class TeamError(Exception):
    """Raised for invalid team operations; the controller maps it to HTTP 400."""


# ── Members ──────────────────────────────────────────────────────────────

def list_members(tenant_id: str) -> list[User]:
    """All users of a tenant, owner first then by join date."""
    role_rank = Case(None, [(User.role == "owner", 0), (User.role == "admin", 1), (User.role == "editor", 2)], 3)
    return list(
        User.select()
        .where(User.tenant == tenant_id)
        .order_by(role_rank, User.created_at.asc())
    )


def list_invitations(tenant_id: str) -> list[Invitation]:
    """Pending invitations for a tenant, newest first."""
    return list(
        Invitation.select()
        .where(Invitation.tenant == tenant_id, Invitation.status == "pending")
        .order_by(Invitation.created_at.desc())
    )


def member_stats(tenant_id: str) -> dict:
    """KPI counts for the team screen."""
    cutoff = datetime.utcnow() - timedelta(days=ACTIVE_WINDOW_DAYS)
    members = list(User.select().where(User.tenant == tenant_id))
    active = sum(1 for m in members if m.last_seen_at and m.last_seen_at >= cutoff)
    pending = Invitation.select().where(
        Invitation.tenant == tenant_id, Invitation.status == "pending"
    ).count()
    roles_used = len({m.role for m in members})
    return {"members": len(members), "active": active, "pending": pending, "roles": roles_used}


def invite_member(tenant_id: str, email: str, role: str) -> Invitation:
    """Create a pending invitation. Raises TeamError on any conflict."""
    email = (email or "").strip().lower()
    if "@" not in email:
        raise TeamError("Email inválido")
    if role not in ASSIGNABLE_ROLES:
        raise TeamError("Rol inválido")

    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        raise TeamError("Cuenta no encontrada")

    existing = User.get_or_none(User.email == email)
    if existing:
        if existing.tenant_id == tenant_id:
            raise TeamError("Esa persona ya es parte del equipo")
        raise TeamError("Ese email ya tiene una cuenta en Mi Precio")

    pending = Invitation.get_or_none(
        (Invitation.email == email) & (Invitation.status == "pending")
    )
    if pending:
        if pending.tenant_id == tenant_id:
            raise TeamError("Ya hay una invitación pendiente para ese email")
        raise TeamError("Ese email tiene una invitación pendiente en otra cuenta")

    return Invitation.create(tenant=tenant, email=email, role=role, status="pending")


def update_member_role(tenant_id: str, user_id: str, role: str) -> User:
    """Change a member's role. Owners can't be demoted here. Raises TeamError."""
    if role not in ASSIGNABLE_ROLES:
        raise TeamError("Rol inválido")
    user = User.get_or_none(User.id == user_id, User.tenant == tenant_id)
    if not user:
        raise TeamError("Miembro no encontrado")
    if user.role == "owner":
        raise TeamError("No se puede cambiar el rol del dueño")
    user.role = role
    user.save()
    return user


def remove_member(tenant_id: str, user_id: str, acting_user_id: str | None) -> User:
    """Remove a member from the team. Owners and yourself can't be removed."""
    user = User.get_or_none(User.id == user_id, User.tenant == tenant_id)
    if not user:
        raise TeamError("Miembro no encontrado")
    if user.role == "owner":
        raise TeamError("No se puede quitar al dueño de la cuenta")
    if acting_user_id and str(user.id) == str(acting_user_id):
        raise TeamError("No podés quitarte a vos mismo")
    user.delete_instance()
    return user


def cancel_invitation(tenant_id: str, invitation_id: str) -> bool:
    """Revoke a pending invitation. Returns False if it doesn't exist."""
    invite = Invitation.get_or_none(Invitation.id == invitation_id, Invitation.tenant == tenant_id)
    if not invite:
        return False
    invite.delete_instance()
    return True
