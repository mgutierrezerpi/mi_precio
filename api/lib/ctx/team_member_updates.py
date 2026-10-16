"""Mutable team-member operations."""

from lib.ctx.team_shared import ASSIGNABLE_ROLES, TeamError, ensure_tenant_memberships
from models import TenantMembership, User


def _member(tenant_id: str, user_id: str) -> tuple[User, TenantMembership]:
    ensure_tenant_memberships(tenant_id)
    membership = TenantMembership.get_or_none(user=user_id, tenant=tenant_id)
    user = User.get_or_none(User.id == user_id)
    if not user or not membership:
        raise TeamError("Miembro no encontrado")
    return user, membership


def update_member_role(tenant_id: str, user_id: str, role: str) -> User:
    """Change a non-owner member's role."""
    if role not in ASSIGNABLE_ROLES:
        raise TeamError("Rol inválido")
    user, membership = _member(tenant_id, user_id)
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
    acting_user_id: str | None,
    role: str | None = None,
    name: str | None = None,
    email: str | None = None,
) -> User:
    """Update editable member fields. At least one field must be provided.

    A User is global (one login across every business it belongs to), so a
    teammate may only change another member's role here. The name is editable
    only by its owner, and the email — the login identity — is never editable
    from the team screen: changing it would hand over the account.
    """
    user, membership = _member(tenant_id, user_id)
    is_self = acting_user_id is not None and str(user.id) == str(acting_user_id)
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
            if not is_self:
                raise TeamError("Sólo podés cambiar tu propio nombre")
            user.name = name
            changed = True

    # The client may echo the current email back; anything else is refused.
    if email is not None and email.strip().lower() != user.email:
        raise TeamError("El email de acceso no se puede cambiar desde Equipo")

    if not changed:
        raise TeamError("No hay cambios para guardar")
    membership.save()
    user._team_role = membership.role
    user.save()
    return user


def remove_member(tenant_id: str, user_id: str, acting_user_id: str | None) -> User:
    """Remove a non-owner team member without allowing self-removal."""
    user, membership = _member(tenant_id, user_id)
    if membership.role == "owner":
        raise TeamError("No se puede quitar al dueño de la cuenta")
    if acting_user_id and str(user.id) == str(acting_user_id):
        raise TeamError("No podés quitarte a vos mismo")
    membership.delete_instance()
    if user.tenant_id == tenant_id:
        remaining = TenantMembership.get_or_none(TenantMembership.user == user.id)
        if remaining:
            user.tenant = remaining.tenant
            user.role = remaining.role
            user.save()
        else:
            user.delete_instance()
    return user
