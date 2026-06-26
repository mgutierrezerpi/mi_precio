from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from lib.ctx import team, activity, plans
from lib.ctx.team_context import TeamError
from lib.ctx.plans_context import PlanLimitError
from controllers.deps import get_current_user, require_admin
from controllers.input_types import InviteMember, UpdateMember
from views import DeletedView, UserView, InvitationView
from models import User

router = APIRouter(tags=["team"])


class UpdateCurrentUser(BaseModel):
    simple_admin_ui: bool | None = None
    admin_ui_mode: str | None = None


@router.get("/users/me")
def get_current_user_endpoint(current_user: dict = Depends(get_current_user)):
    user = User.get_or_none(User.id == current_user.get("sub"))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return UserView.render(user)


@router.patch("/users/me")
def update_current_user_endpoint(data: UpdateCurrentUser, current_user: dict = Depends(get_current_user)):
    user = User.get_or_none(User.id == current_user.get("sub"))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if data.simple_admin_ui is None and data.admin_ui_mode is None:
        raise HTTPException(status_code=400, detail="No hay cambios para guardar")
    if data.admin_ui_mode is not None:
        if data.admin_ui_mode not in ("simple", "medium", "full"):
            raise HTTPException(status_code=400, detail="Modo inválido")
        user.admin_ui_mode = data.admin_ui_mode
        user.simple_admin_ui = data.admin_ui_mode == "simple"
    elif data.simple_admin_ui is not None:
        user.simple_admin_ui = bool(data.simple_admin_ui)
        user.admin_ui_mode = "simple" if user.simple_admin_ui else "full"
    user.save()
    return UserView.render(user)


@router.get("/tenants/{tenant_id}/members")
def list_members_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return UserView.render_many(team.list_members(tenant_id))


@router.get("/tenants/{tenant_id}/members/stats")
def member_stats_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return team.member_stats(tenant_id)


@router.get("/tenants/{tenant_id}/invitations")
def list_invitations_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return InvitationView.render_many(team.list_invitations(tenant_id))


@router.post("/tenants/{tenant_id}/members", status_code=201)
def invite_member_endpoint(tenant_id: str, data: InviteMember, current_user: dict = Depends(require_admin)):
    try:
        plans.assert_can_add(tenant_id, "members")
    except PlanLimitError as e:
        raise HTTPException(status_code=402, detail=str(e))
    try:
        invite = team.invite_member(tenant_id, data.email, data.role)
    except TeamError as e:
        raise HTTPException(status_code=400, detail=str(e))
    activity.record(tenant_id, "member.invited", f"Invitó a «{invite.email}» como {invite.role}",
                    actor=current_user.get("email"), actor_id=current_user.get("sub"),
                    entity_type="invitation", entity_id=invite.id)
    return InvitationView.render(invite)


@router.patch("/tenants/{tenant_id}/members/{user_id}")
def update_member_endpoint(tenant_id: str, user_id: str, data: UpdateMember, current_user: dict = Depends(require_admin)):
    try:
        user = team.update_member(tenant_id, user_id, data.role, data.simple_admin_ui, data.admin_ui_mode)
    except TeamError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if data.role is not None:
        activity.record(tenant_id, "member.role_changed", f"Cambió el rol de «{user.email}» a {user.role}",
                        actor=current_user.get("email"), actor_id=current_user.get("sub"),
                        entity_type="user", entity_id=user.id)
    return UserView.render(user)


@router.delete("/tenants/{tenant_id}/members/{user_id}")
def remove_member_endpoint(tenant_id: str, user_id: str, current_user: dict = Depends(require_admin)):
    try:
        user = team.remove_member(tenant_id, user_id, current_user.get("sub"))
    except TeamError as e:
        raise HTTPException(status_code=400, detail=str(e))
    activity.record(tenant_id, "member.removed", f"Quitó a «{user.email}» del equipo",
                    actor=current_user.get("email"), actor_id=current_user.get("sub"),
                    entity_type="user", entity_id=user_id)
    return DeletedView()


@router.delete("/tenants/{tenant_id}/invitations/{invitation_id}")
def cancel_invitation_endpoint(tenant_id: str, invitation_id: str, current_user: dict = Depends(require_admin)):
    if not team.cancel_invitation(tenant_id, invitation_id):
        raise HTTPException(status_code=404, detail="Invitation not found")
    return DeletedView()
