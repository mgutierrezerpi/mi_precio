"""Team context - members of a tenant, their roles, and pending invitations."""

from datetime import datetime, timedelta

from peewee import Case

from models import Tenant, User, Invitation, TenantMembership

# Roles an owner/admin may assign when inviting or editing a member (never "owner").
ASSIGNABLE_ROLES = ("admin", "editor", "viewer")
# A member counts as "active" if seen within this window.
ACTIVE_WINDOW_DAYS = 14


class TeamError(Exception):
    """Raised for invalid team operations; the controller maps it to HTTP 400."""


def _ensure_tenant_memberships(tenant_id: str) -> None:
    """Keep direct/unit-created legacy users compatible with memberships."""
    for user in User.select().where(User.tenant == tenant_id):
        TenantMembership.get_or_create(
            user=user, tenant=tenant_id, defaults={"role": user.role or "owner"}
        )


# ── Members ──────────────────────────────────────────────────────────────


def list_members(tenant_id: str) -> list[User]:
    """All users of a tenant, owner first then by join date."""
    _ensure_tenant_memberships(tenant_id)
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
    membership_roles = {
        membership.user_id: membership.role
        for membership in TenantMembership.select().where(
            TenantMembership.tenant == tenant_id
        )
    }
    for member in members:
        member._team_role = membership_roles.get(member.id, member.role or "owner")
    return members


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
    pending = (
        Invitation.select()
        .where(Invitation.tenant == tenant_id, Invitation.status == "pending")
        .count()
    )
    roles_used = len({m.role for m in members})
    return {
        "members": len(members),
        "active": active,
        "pending": pending,
        "roles": roles_used,
    }


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
    _ensure_tenant_memberships(tenant_id)

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


def update_member_role(tenant_id: str, user_id: str, role: str) -> User:
    """Change a member's role. Owners can't be demoted here. Raises TeamError."""
    if role not in ASSIGNABLE_ROLES:
        raise TeamError("Rol inválido")
    _ensure_tenant_memberships(tenant_id)
    membership = TenantMembership.get_or_none(user=user_id, tenant=tenant_id)
    user = User.get_or_none(User.id == user_id)
    if not user or not membership:
        raise TeamError("Miembro no encontrado")
    if membership.role == "owner":
        raise TeamError("No se puede cambiar el rol del dueño")
    membership.role = role
    membership.save()
    user.role = role
    user.save(only=[User.role])
    user._team_role = role
    return user


def update_member(
    tenant_id: str,
    user_id: str,
    role: str | None = None,
    name: str | None = None,
    email: str | None = None,
) -> User:
    """Update editable member fields. At least one field must be provided."""
    _ensure_tenant_memberships(tenant_id)
    membership = TenantMembership.get_or_none(user=user_id, tenant=tenant_id)
    user = User.get_or_none(User.id == user_id)
    if not user or not membership:
        raise TeamError("Miembro no encontrado")
    changed = False
    if role is not None:
        if role not in ASSIGNABLE_ROLES:
            raise TeamError("Rol inválido")
        if membership.role == "owner":
            raise TeamError("No se puede cambiar el rol del dueño")
        membership.role = role
        user.role = role
        changed = True

    if name is not None:
        name = name.strip()
        if not name:
            raise TeamError("El nombre no puede estar vacío")
        if len(name) > 255:
            raise TeamError("El nombre es demasiado largo")
        if user.name != name:
            user.name = name
            changed = True

    if email is not None:
        email = email.strip().lower()
        if "@" not in email or len(email) > 255:
            raise TeamError("Email inválido")
        existing = User.get_or_none(User.email == email)
        if existing and existing.id != user.id:
            raise TeamError("Ese email ya tiene una cuenta en Mi Precio")
        if user.email != email:
            user.email = email
            changed = True

    if not changed:
        raise TeamError("No hay cambios para guardar")
    membership.save()
    user._team_role = membership.role
    user.save()
    return user


def remove_member(tenant_id: str, user_id: str, acting_user_id: str | None) -> User:
    """Remove a member from the team. Owners and yourself can't be removed."""
    _ensure_tenant_memberships(tenant_id)
    membership = TenantMembership.get_or_none(user=user_id, tenant=tenant_id)
    user = User.get_or_none(User.id == user_id)
    if not user or not membership:
        raise TeamError("Miembro no encontrado")
    if membership.role == "owner":
        raise TeamError("No se puede quitar al dueño de la cuenta")
    if acting_user_id and str(user.id) == str(acting_user_id):
        raise TeamError("No podés quitarte a vos mismo")
    membership.delete_instance()
    # Preserve the legacy user record when they still belong to another tenant.
    if user.tenant_id == tenant_id:
        remaining = TenantMembership.get_or_none(TenantMembership.user == user.id)
        if remaining:
            user.tenant = remaining.tenant
            user.role = remaining.role
            user.save()
        else:
            user.delete_instance()
    return user


def cancel_invitation(tenant_id: str, invitation_id: str) -> bool:
    """Revoke a pending invitation. Returns False if it doesn't exist."""
    invite = Invitation.get_or_none(
        Invitation.id == invitation_id, Invitation.tenant == tenant_id
    )
    if not invite:
        return False
    invite.delete_instance()
    return True
