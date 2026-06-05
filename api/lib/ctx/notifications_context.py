"""Notifications context - per-user in-app notification feed built from tenant activity.

There is no email delivery; "notifications" are the tenant's recorded activity
(see activity_context), filtered by each user's category preferences, with a
per-user unread count tracked via `notifications_seen_at`."""

import json
import logging
from datetime import datetime

from models import User, Activity

logger = logging.getLogger(__name__)

# Maps an activity action to a notification category.
ACTION_CATEGORY = {
    "order.created": "sales",
    "product.created": "catalog",
    "product.deleted": "catalog",
    "list.created": "catalog",
    "list.published": "catalog",
    "customer.created": "customers",
    "member.invited": "team",
    "member.role_changed": "team",
    "member.removed": "team",
}
CATEGORIES = ("sales", "catalog", "customers", "team")
DEFAULT_PREFS = {c: True for c in CATEGORIES}


def _prefs(user: User | None) -> dict:
    """A complete prefs dict (all categories present), defaulting unknowns to enabled."""
    if not user or not user.notif_prefs:
        return dict(DEFAULT_PREFS)
    try:
        stored = json.loads(user.notif_prefs)
    except (ValueError, TypeError):
        return dict(DEFAULT_PREFS)
    return {c: bool(stored.get(c, True)) for c in CATEGORIES}


def get_prefs(user_id: str) -> dict:
    return _prefs(User.get_or_none(User.id == user_id))


def update_prefs(user_id: str, prefs: dict) -> dict | None:
    user = User.get_or_none(User.id == user_id)
    if not user:
        return None
    current = _prefs(user)
    for c in CATEGORIES:
        if c in prefs and prefs[c] is not None:
            current[c] = bool(prefs[c])
    user.notif_prefs = json.dumps(current)
    user.save()
    return current


def list_notifications(tenant_id: str, user_id: str, limit: int = 30) -> dict:
    """Recent tenant activity the user opted into, plus their unread count + prefs."""
    user = User.get_or_none(User.id == user_id)
    prefs = _prefs(user)
    enabled = {c for c, on in prefs.items() if on}
    seen_at = user.notifications_seen_at if user else None

    rows = list(
        Activity.select()
        .where(Activity.tenant == tenant_id)
        .order_by(Activity.created_at.desc())
        .limit(100)
    )
    matching = [a for a in rows if ACTION_CATEGORY.get(a.action) in enabled]
    unread = sum(1 for a in matching if seen_at is None or a.created_at > seen_at)
    return {"items": matching[:limit], "unread": unread, "prefs": prefs}


def mark_seen(user_id: str) -> bool:
    user = User.get_or_none(User.id == user_id)
    if not user:
        return False
    user.notifications_seen_at = datetime.utcnow()
    user.save()
    return True
