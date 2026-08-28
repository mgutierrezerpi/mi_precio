from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, field_serializer


class BaseView(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    @field_serializer("*", when_used="always")
    def _stamp_utc(self, value):
        """Send timestamps as the instants they are, not as bare wall clocks.

        The models store `datetime.utcnow()`, which is naive, so Pydantic used
        to render it as `2026-08-28T12:52:23` with no offset. A browser parses
        a string like that as *local* time, which is how a lead created at
        09:52 in Montevideo came back reading 12:52 — the UTC clock wearing the
        reader's timezone.

        Marking the instant here fixes every screen at once and leaves the
        choice of timezone where it belongs: each client renders it in its own.
        Non-datetime values pass through untouched.
        """
        if isinstance(value, datetime) and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value
