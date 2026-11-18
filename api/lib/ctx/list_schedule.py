"""The validity period of a price list, in calendar days.

`starts_at` and `ends_at` mean the day the owner picked, not an instant: the
date as written is the date that applies, with no timezone conversion. Both days
count whole, and «today» is the calendar day where the shop is.

Rows saved before this rule hold a wall clock (`2026-09-01 09:00`) or a midnight
with an offset (`2026-09-01 00:00:00+00:00`, which Peewee hands back as text).
Their first ten characters are still the day that was picked, so they need no
backfill.
"""

from datetime import UTC, date, datetime, time
from zoneinfo import ZoneInfo

DEFAULT_TIMEZONE = "America/Montevideo"

CURRENT = "current"
UPCOMING = "upcoming"
ENDED = "ended"


def calendar_day(value: date | str | None) -> date | None:
    """The calendar day a stored or submitted value was written for."""
    if not value:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value)[:10])


def calendar_midnight(value: date | str | None) -> datetime | None:
    """The stored form of a calendar day: naive midnight of that same day."""
    day = calendar_day(value)
    return datetime.combine(day, time.min) if day else None


def shop_today(tenant, now: datetime | None = None) -> date:
    """Today's calendar day in the shop's own timezone."""
    try:
        zone = ZoneInfo(getattr(tenant, "timezone", None) or DEFAULT_TIMEZONE)
    except (KeyError, ValueError, OSError):
        zone = ZoneInfo(DEFAULT_TIMEZONE)
    return (now or datetime.now(UTC)).astimezone(zone).date()


def schedule_state(price_list, today: date) -> str:
    """Whether `today` falls before, inside or after the list's period."""
    starts = calendar_day(price_list.starts_at)
    ends = calendar_day(price_list.ends_at)
    if starts and today < starts:
        return UPCOMING
    if ends and today > ends:
        return ENDED
    return CURRENT


def on_schedule(price_list, today: date | None = None) -> bool:
    """Whether the list may be served today. Lists with no dates always may."""
    if not price_list.starts_at and not price_list.ends_at:
        return True
    return (
        schedule_state(price_list, today or shop_today(price_list.tenant)) == CURRENT
    )
