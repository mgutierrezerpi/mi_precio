from fastapi import APIRouter, Depends
from lib.ctx import notifications, identity
from controllers.deps import get_current_user
from controllers.input_types import UpdateNotifPrefs
from views import ActivityView

router = APIRouter(tags=["notifications"])


@router.get("/tenants/{tenant_id}/notifications")
def list_notifications_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    # This endpoint is polled from the topbar bell on every admin screen, so use it
    # as a presence heartbeat to keep the member's "last seen" fresh.
    identity.touch_last_seen(current_user.get("sub"))
    data = notifications.list_notifications(tenant_id, current_user.get("sub"))
    return {
        "items": ActivityView.render_many(data["items"]),
        "unread": data["unread"],
        "prefs": data["prefs"],
    }


@router.patch("/tenants/{tenant_id}/notifications/prefs")
def update_notif_prefs_endpoint(tenant_id: str, data: UpdateNotifPrefs, current_user: dict = Depends(get_current_user)):
    prefs = notifications.update_prefs(current_user.get("sub"), data.model_dump(exclude_unset=True))
    return {"prefs": prefs}


@router.post("/tenants/{tenant_id}/notifications/seen")
def mark_notifications_seen_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    notifications.mark_seen(current_user.get("sub"))
    return {"ok": True}
