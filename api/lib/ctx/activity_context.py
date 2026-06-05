"""Activity context - tenant activity feed (who did what), shown live on the dashboard."""

import logging

from models import Tenant, Activity

logger = logging.getLogger(__name__)


def record(tenant_id: str, action: str, summary: str, actor: str | None = None,
           actor_id: str | None = None, entity_type: str | None = None,
           entity_id: str | None = None) -> Activity | None:
    """Append an activity entry. Never raises — a failed audit log must not break the request."""
    try:
        tenant = Tenant.get_or_none(Tenant.id == tenant_id)
        if not tenant:
            return None
        return Activity.create(
            tenant=tenant, action=action, summary=summary,
            actor=actor, actor_id=actor_id, entity_type=entity_type, entity_id=entity_id,
        )
    except Exception:  # pragma: no cover - defensive
        logger.exception("Failed to record activity")
        return None


def list_activity(tenant_id: str, limit: int = 20) -> list[Activity]:
    """Most recent activity for a tenant, newest first."""
    return list(
        Activity.select()
        .where(Activity.tenant == tenant_id)
        .order_by(Activity.created_at.desc())
        .limit(limit)
    )
