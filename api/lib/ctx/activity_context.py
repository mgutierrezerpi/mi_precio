"""Activity context - tenant activity feed (who did what), shown live on the dashboard."""

import json
import logging
from datetime import timedelta

from models import Activity, Tenant
from models.base import utc_now

logger = logging.getLogger(__name__)


def record(
    tenant_id: str,
    action: str,
    summary: str,
    actor: str | None = None,
    actor_id: str | None = None,
    entity_type: str | None = None,
    entity_id: str | None = None,
    meta: dict | None = None,
    coalesce_minutes: int | None = None,
) -> Activity | None:
    """Append an activity entry. Never raises — a failed audit log must not break the request.

    `summary` is the pre-rendered Spanish fallback; `meta` holds the dynamic values
    (name, email, amount…) so the client can rebuild the text in the viewer's language.

    `coalesce_minutes` is for screens that autosave: the same person editing
    the same thing again within that window refreshes the last entry instead of
    adding one per keystroke-pause, which used to bury the log."""
    try:
        tenant = Tenant.get_or_none(Tenant.id == tenant_id)
        if not tenant:
            return None
        if coalesce_minutes:
            recent = _recent_entry(
                tenant_id, action, actor_id, entity_id, coalesce_minutes
            )
            if recent:
                recent.summary = summary
                recent.meta = json.dumps(meta) if meta else None
                recent.created_at = utc_now()
                recent.save()
                return recent
        entry = Activity.create(
            tenant=tenant,
            action=action,
            summary=summary,
            meta=json.dumps(meta) if meta else None,
            actor=actor,
            actor_id=actor_id,
            entity_type=entity_type,
            entity_id=entity_id,
        )
        _push(tenant_id, action, summary, actor_id)
        return entry
    except Exception:  # pragma: no cover - defensive
        logger.exception("Failed to record activity")
        return None


def _push(tenant_id: str, action: str, summary: str, actor_id: str | None) -> None:
    """Send a Web Push for this activity to opted-in teammates. Never raises."""
    try:
        # Imported here to avoid a circular import at module load.
        from lib.ctx import push
        from lib.ctx.notifications_context import ACTION_CATEGORY

        category = ACTION_CATEGORY.get(action)
        if category:
            push.notify_activity(tenant_id, category, summary, actor_id)
    except Exception:  # pragma: no cover - defensive
        logger.exception("Failed to dispatch push notification")


def _recent_entry(
    tenant_id: str,
    action: str,
    actor_id: str | None,
    entity_id: str | None,
    minutes: int,
) -> Activity | None:
    latest = (
        Activity.select()
        .where(Activity.tenant == tenant_id)
        .order_by(Activity.created_at.desc(), Activity.id.desc())
        .first()
    )
    if (
        latest
        and latest.action == action
        and latest.actor_id == actor_id
        and latest.entity_id == (str(entity_id) if entity_id else None)
        and latest.created_at >= utc_now() - timedelta(minutes=minutes)
    ):
        return latest
    return None


def list_activity(tenant_id: str, limit: int = 20, offset: int = 0) -> list[Activity]:
    """Activity for a tenant, newest first, with offset pagination."""
    return list(
        Activity.select()
        .where(Activity.tenant == tenant_id)
        .order_by(Activity.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
