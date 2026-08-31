"""Tenant-user presence updates kept separate from identity provisioning."""

from datetime import UTC, datetime

from models import User


def touch_last_seen(user_id: str, min_interval_seconds: int = 60) -> None:
    """Update presence at a bounded rate for polling endpoints."""
    user = User.get_or_none(User.id == user_id)
    if not user:
        return
    # Peewee stores this legacy column without timezone metadata; derive the
    # value from an aware UTC clock before crossing that storage boundary.
    now = datetime.now(UTC).replace(tzinfo=None)
    if (
        user.last_seen_at is None
        or (now - user.last_seen_at).total_seconds() >= min_interval_seconds
    ):
        user.last_seen_at = now
        user.save()
