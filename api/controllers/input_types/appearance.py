"""Shared validators for the public-page appearance fields.

The same design id and hex colour rules apply to the tenant-wide defaults
(`UpdateTenant`) and to the per-list overrides (`UpdateList`), so they live here
instead of being duplicated in both.
"""

import re

# Visual templates for the public price list. Mirrors LIST_DESIGNS in
# web_app/src/components/appearance/ListAppearanceFields.tsx — keep both in sync.
LIST_DESIGNS = {
    "store",
    "classic",
    "nordic",
    "fine",
    "modern",
    "photo",
    "cards",
    "catalog",
    "tech",
    "pencil-bakery",
    "pencil-garden",
    "pencil-market",
    "pencil-evening",
    "pencil-workshop",
    "pencil-cheese",
    "pencil-flower",
    "pencil-flower-summer",
    "pencil-flower-winter",
    "pencil-flower-spring",
    "pencil-wine",
    "pencil-cheese-alternating",
    "pencil-hardware-alternating",
    "pencil-hardware-weekend",
    "pencil-hardware-shelf",
    "pencil-casa-ritual",
    "pencil-casa-bath",
    "pencil-casa-signature",
    "pencil-casa-services",
    "pencil-auto-detail",
    "pencil-blush-bloom",
    "pencil-nova",
    "pencil-beardy",
    "pencil-calm-spa",
    "pencil-union-barber",
    "pencil-studio-mono",
    "pencil-beauty-issue",
    "pencil-obsidian-quarterly",
    "pencil-cafecitos",
}


def validate_design(v: str | None) -> str | None:
    """Empty means "no design of its own" — a list falls back to the tenant's."""
    if v is None or v == "":
        return None
    if v not in LIST_DESIGNS:
        raise ValueError(f"design must be one of {sorted(LIST_DESIGNS)}")
    return v


def validate_hex_color(v: str | None, label: str = "Color") -> str | None:
    if v is None or v == "":
        return None
    if not re.match(r"^#[0-9a-fA-F]{6}$", v):
        raise ValueError(f"{label} must be a hex value like #7C3AED")
    return v.upper()
