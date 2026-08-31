import logging

from fastapi import APIRouter, HTTPException, Depends

from lib.ctx import team, activity, plans
from lib.ctx.team_context import TeamError
from lib.ctx.plans_context import PlanLimitError
from controllers.deps import get_current_user, require_active_plan, require_admin
from controllers.input_types import InviteMember, UpdateMember
from views import DeletedView, UserView, InvitationView
from models import User
from tasks import send_invitation_email

router = APIRouter(tags=["team"])
logger = logging.getLogger(__name__)

# Team management is CRM data, so it's closed while the tenant owes us a plan.
# `/users/me` stays open: the app needs it to know who is sitting in front of
# the plan screen.
plan_gated = [Depends(require_active_plan)]


@router.get("/users/me")
def get_current_user_endpoint(current_user: dict = Depends(get_current_user)):
    user = User.get_or_none(User.id == current_user.get("sub"))
    if not user or str(user.tenant_id) != str(current_user.get("tenant_id")):
        raise HTTPException(
            status_code=401, detail="Ya no tenés acceso a este espacio de trabajo"
        )
    return UserView.render(user, current_user.get("role"))


@router.get("/tenants/{tenant_id}/members", dependencies=plan_gated)
def list_members_endpoint(
    tenant_id: str, current_user: dict = Depends(get_current_user)
):
    return UserView.render_many(team.list_members(tenant_id))


@router.get("/tenants/{tenant_id}/members/stats", dependencies=plan_gated)
def member_stats_endpoint(
    tenant_id: str, current_user: dict = Depends(get_current_user)
):
    return team.member_stats(tenant_id)


@router.get("/tenants/{tenant_id}/invitations", dependencies=plan_gated)
def list_invitations_endpoint(
    tenant_id: str, current_user: dict = Depends(get_current_user)
):
    return InvitationView.render_many(team.list_invitations(tenant_id))


@router.post("/tenants/{tenant_id}/members", status_code=201, dependencies=plan_gated)
def invite_member_endpoint(
    tenant_id: str, data: InviteMember, current_user: dict = Depends(require_admin)
):
    try:
        plans.assert_can_add(tenant_id, "members")
    except PlanLimitError as e:
        raise HTTPException(status_code=402, detail=str(e))
    try:
        invite = team.invite_member(tenant_id, data.email, data.role)
    except TeamError as e:
        raise HTTPException(status_code=400, detail=str(e))
    activity.record(
        tenant_id,
        "member.invited",
        f"Invitó a «{invite.email}» como {invite.role}",
        actor=current_user.get("email"),
        actor_id=current_user.get("sub"),
        entity_type="invitation",
        entity_id=invite.id,
        meta={"email": invite.email, "role": invite.role},
    )
    try:
        send_invitation_email(invite.email, invite.role, invite.tenant.name)
    except Exception:
        logger.exception("Failed to queue invitation email for %s", invite.email)
    return InvitationView.render(invite)


@router.patch("/tenants/{tenant_id}/members/{user_id}", dependencies=plan_gated)
def update_member_endpoint(
    tenant_id: str,
    user_id: str,
    data: UpdateMember,
    current_user: dict = Depends(require_admin),
):
    try:
        user = team.update_member(
            tenant_id, user_id, role=data.role, name=data.name, email=data.email
        )
    except TeamError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if any(value is not None for value in (data.role, data.name, data.email)):
        action = (
            "member.role_changed"
            if data.role is not None and data.name is None and data.email is None
            else "member.updated"
        )
        description = (
            f"Cambió el rol de «{user.email}» a {user.role}"
            if action == "member.role_changed"
            else f"Actualizó los datos de «{user.email}»"
        )
        activity.record(
            tenant_id,
            action,
            description,
            actor=current_user.get("email"),
            actor_id=current_user.get("sub"),
            entity_type="user",
            entity_id=user.id,
            meta={"email": user.email, "role": user.role, "name": user.name},
        )
    return UserView.render(user)


@router.delete("/tenants/{tenant_id}/members/{user_id}", dependencies=plan_gated)
def remove_member_endpoint(
    tenant_id: str, user_id: str, current_user: dict = Depends(require_admin)
):
    try:
        user = team.remove_member(tenant_id, user_id, current_user.get("sub"))
    except TeamError as e:
        raise HTTPException(status_code=400, detail=str(e))
    activity.record(
        tenant_id,
        "member.removed",
        f"Quitó a «{user.email}» del equipo",
        actor=current_user.get("email"),
        actor_id=current_user.get("sub"),
        entity_type="user",
        entity_id=user_id,
        meta={"email": user.email},
    )
    return DeletedView()


@router.delete(
    "/tenants/{tenant_id}/invitations/{invitation_id}", dependencies=plan_gated
)
def cancel_invitation_endpoint(
    tenant_id: str, invitation_id: str, current_user: dict = Depends(require_admin)
):
    if not team.cancel_invitation(tenant_id, invitation_id):
        raise HTTPException(status_code=404, detail="Invitation not found")
    return DeletedView()
