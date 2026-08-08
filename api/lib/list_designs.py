"""Public-list design capabilities shared by validation and the editor API."""

from typing import Any

CONTENT_BLOCK_TYPES = frozenset({"catalog", "contact", "promotion_strip"})

# The renderer can give each design a different visual treatment, but these are
# the semantic blocks it can receive. Keeping this registry in the API gives
# editors one source of truth instead of accepting arbitrary client JSON.
DESIGN_SPECS: dict[str, dict[str, Any]] = {
    design: {"blocks": sorted(CONTENT_BLOCK_TYPES)}
    for design in (
        "store",
        "classic",
        "nordic",
        "fine",
        "modern",
        "photo",
        "cards",
        "catalog",
        "tech",
    )
}


def default_design(design: str | None) -> str:
    """Resolve an omitted legacy design to the stable default."""
    return design if design in DESIGN_SPECS else "store"


def supported_blocks(design: str | None) -> set[str]:
    return set(DESIGN_SPECS[default_design(design)]["blocks"])


def public_design_specs() -> list[dict[str, Any]]:
    return [
        {"id": design, "blocks": spec["blocks"]}
        for design, spec in DESIGN_SPECS.items()
    ]
