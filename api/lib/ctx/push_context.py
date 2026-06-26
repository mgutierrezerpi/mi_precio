"""Web Push context - PWA desktop/mobile notifications.

Users subscribe their devices (phone, laptop) from the browser; we store the
endpoint + keys and, when tenant activity happens, encrypt and deliver a push so
the OS shows a notification even when the app/tab is closed.

Sending is best-effort and fire-and-forget: a failed push must never break the
request that triggered it. Dead subscriptions (HTTP 404/410) are pruned."""

import json
import logging
import threading

from config import settings
from models import PushSubscription, Tenant, User

logger = logging.getLogger(__name__)

# Title shown per notification category (body is the activity summary).
CATEGORY_TITLE = {
    "sales": "Nueva venta 💰",
    "catalog": "Catálogo actualizado 📦",
    "customers": "Nuevo cliente 👤",
    "team": "Novedad del equipo 👥",
}


def subscribe(tenant_id: str, user_id: str, subscription: dict) -> PushSubscription | None:
    """Store (or refresh) a browser push subscription. Idempotent by endpoint."""
    endpoint = subscription.get("endpoint")
    keys = subscription.get("keys") or {}
    p256dh, auth = keys.get("p256dh"), keys.get("auth")
    if not endpoint or not p256dh or not auth:
        return None

    existing = PushSubscription.get_or_none(PushSubscription.endpoint == endpoint)
    if existing:
        existing.tenant = tenant_id
        existing.user = user_id
        existing.p256dh = p256dh
        existing.auth = auth
        existing.save()
        return existing
    return PushSubscription.create(
        tenant=tenant_id, user=user_id, endpoint=endpoint, p256dh=p256dh, auth=auth
    )


def unsubscribe(endpoint: str) -> bool:
    """Remove a subscription (the device opted out or its endpoint expired)."""
    if not endpoint:
        return False
    return bool(
        PushSubscription.delete().where(PushSubscription.endpoint == endpoint).execute()
    )


def _send_one(sub: PushSubscription, payload: str) -> None:
    """Deliver a single push, deleting the subscription if the endpoint is gone."""
    from pywebpush import WebPushException, webpush

    try:
        webpush(
            subscription_info={
                "endpoint": sub.endpoint,
                "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
            },
            data=payload,
            vapid_private_key=settings.vapid_private_key,
            vapid_claims={"sub": settings.vapid_subject},
        )
    except WebPushException as exc:
        status = getattr(exc.response, "status_code", None)
        if status in (404, 410):  # endpoint permanently gone
            PushSubscription.delete().where(PushSubscription.id == sub.id).execute()
        else:
            logger.warning("Push delivery failed (%s): %s", status, exc)
    except Exception:  # pragma: no cover - defensive, never break the caller
        logger.exception("Unexpected error sending push")


def _deliver(subs: list[PushSubscription], payload: str) -> None:
    for sub in subs:
        _send_one(sub, payload)


def send_to_users(user_ids: list[str], title: str, body: str, url: str = "/admin",
                  tag: str | None = None) -> None:
    """Fan out a notification to every device of the given users (in a thread)."""
    if not settings.push_enabled or not user_ids:
        return
    subs = list(PushSubscription.select().where(PushSubscription.user.in_(user_ids)))
    if not subs:
        return
    payload = json.dumps({"title": title, "body": body, "url": url, "tag": tag})
    # Network I/O off the request path; pushes are non-critical.
    threading.Thread(target=_deliver, args=(subs, payload), daemon=True).start()


def notify_activity(tenant_id: str, category: str, summary: str,
                    actor_id: str | None = None) -> None:
    """Push a tenant-activity notification to opted-in teammates (not the actor)."""
    if not settings.push_enabled or not category:
        return
    # Import here to avoid a circular import with notifications_context.
    from lib.ctx import notifications

    if not Tenant.get_or_none(Tenant.id == tenant_id):
        return
    recipients = [
        u.id
        for u in User.select().where(User.tenant == tenant_id)
        if u.id != actor_id and notifications.get_prefs(u.id).get(category, True)
    ]
    title = CATEGORY_TITLE.get(category, "MiPrecio")
    send_to_users(recipients, title, summary, tag=category)
