"""Validation rules for public lead capture."""

import re

STATUSES = ("new", "contacted", "converted", "discarded")
SOURCES = ("form", "cart", "media_kit")
MAX_MESSAGE = 2000


class LeadRejected(Exception):
    """The public form said something we will not store (HTTP 400)."""


def clean_phone(value: str | None) -> str | None:
    """Normalize a phone so the CRM can safely build a wa.me link."""
    if not value:
        return None
    digits = re.sub(r"\D", "", value)
    digits = re.sub(r"^00", "", digits)
    return digits if 6 <= len(digits) <= 15 else None


def clean_email(value: str | None) -> str | None:
    if not value:
        return None
    value = value.strip()
    return value if re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value) else None
