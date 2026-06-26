from fastapi import APIRouter, Depends
from config import settings
from lib.ctx import notifications, identity, push
from controllers.deps import get_current_user
from controllers.input_types import UpdateNotifPrefs, PushSubscribe, PushUnsubscribe
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


# --- Web Push (PWA desktop/mobile notifications) ---

@router.get("/push/public-key")
def push_public_key_endpoint(current_user: dict = Depends(get_current_user)):
    """VAPID public key the browser needs to subscribe; `enabled` is false when
    the server has no keys configured (push is a no-op then)."""
    return {"key": settings.vapid_public_key, "enabled": settings.push_enabled}


@router.post("/tenants/{tenant_id}/push/subscribe")
def push_subscribe_endpoint(tenant_id: str, data: PushSubscribe, current_user: dict = Depends(get_current_user)):
    sub = push.subscribe(tenant_id, current_user.get("sub"), data.model_dump())
    return {"ok": sub is not None}


@router.post("/tenants/{tenant_id}/push/unsubscribe")
def push_unsubscribe_endpoint(tenant_id: str, data: PushUnsubscribe, current_user: dict = Depends(get_current_user)):
    push.unsubscribe(data.endpoint)
    return {"ok": True}
