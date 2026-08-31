"""Price normalization for AI-extracted menu records."""

import re


def parse_price(value: str | float | None) -> float:
    """Convert a human-entered currency value into a decimal price."""
    if not value:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    cleaned = re.sub(r"[^\d.,]", "", str(value))
    if "," in cleaned and "." in cleaned:
        cleaned = cleaned.replace(",", "")
    elif "," in cleaned:
        cleaned = cleaned.replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return 0.0
