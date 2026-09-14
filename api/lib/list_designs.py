"""Public-list design capabilities shared by validation and the editor API."""

from typing import Any

CONTENT_BLOCK_TYPES = frozenset({"catalog", "contact", "promotion_strip"})

# Field identifiers describe authored content that a renderer actually consumes.
# They are wire-format paths, not form labels, so every client can build its own
# editor from the same stable contract.
HERO_FIELDS = (
    "hero.eyebrow",
    "hero.title",
    "hero.body",
)
ACTION_FIELDS = (
    "template.checkout_channel",
    "template.instagram_handle",
)
COMMON_FIELDS = (*HERO_FIELDS, *ACTION_FIELDS)
STANDARD_FIELDS = (*COMMON_FIELDS, "template.font")
EDITORIAL_FIELDS = (
    *STANDARD_FIELDS,
    "template.price_format",
    "template.divider_icon",
    "template.background_color",
    "template.text_color",
    "template.muted_color",
    "template.accent_color",
    "template.dark_panel_color",
    "template.image",
    "template.image_label",
    "template.image_title",
    "template.promo_eyebrow",
    "template.promo_title",
    "template.promo_body",
    "template.promo_price",
    "template.promo_note",
    "template.footer_left",
    "template.footer_right",
)
IMAGE_FOOTER_FIELDS = (
    *COMMON_FIELDS,
    "template.image",
    "template.footer_left",
    "template.footer_right",
)


def _spec(fields: tuple[str, ...]) -> dict[str, Any]:
    return {
        "schema_version": 1,
        "blocks": sorted(CONTENT_BLOCK_TYPES),
        "fields": list(fields),
    }


# The canonical template contract. Adding a design means declaring its editable
# fields here; clients must not infer capabilities from the design name.
DESIGN_SPECS: dict[str, dict[str, Any]] = {
    **{
        design: _spec(STANDARD_FIELDS)
        for design in (
            "store", "classic", "nordic", "fine", "modern", "photo",
            "cards", "catalog", "tech",
        )
    },
    **{
        design: _spec(EDITORIAL_FIELDS)
        for design in (
            "pencil-bakery", "pencil-garden", "pencil-market",
            "pencil-evening", "pencil-workshop", "pencil-cheese",
            "pencil-flower", "pencil-flower-summer", "pencil-flower-winter",
            "pencil-flower-spring", "pencil-wine", "pencil-hardware-weekend",
        )
    },
    **{
        design: _spec(IMAGE_FOOTER_FIELDS)
        for design in (
            "pencil-cheese-alternating", "pencil-hardware-alternating",
            "pencil-hardware-shelf", "pencil-casa-ritual",
            "pencil-casa-bath", "pencil-auto-detail",
            "pencil-obsidian-quarterly",
        )
    },
    "pencil-casa-signature": _spec(
        (*COMMON_FIELDS, "template.footer_left", "template.footer_right")
    ),
    "pencil-casa-services": _spec(
        (
            *ACTION_FIELDS,
            "template.masthead",
            "template.brand_label",
            "template.edition_label",
            "template.uncategorized_label",
            "template.footer_left",
        )
    ),
    "pencil-blush-bloom": _spec(COMMON_FIELDS),
    "pencil-nova": _spec(COMMON_FIELDS),
    "pencil-beardy": _spec((*COMMON_FIELDS, "template.image")),
    "pencil-calm-spa": _spec(COMMON_FIELDS),
    "pencil-union-barber": _spec(COMMON_FIELDS),
    "pencil-studio-mono": _spec(COMMON_FIELDS),
    "pencil-beauty-issue": _spec((*COMMON_FIELDS, "template.image")),
    "pencil-cafecitos": _spec(
        (
            *COMMON_FIELDS,
            "template.logo",
            "template.profile_name",
            "template.profile_image",
            "template.story_videos",
            "template.story_metrics",
            "template.film_images",
            "template.collaboration_heading",
            "template.stories_heading",
        )
    ),
}

PRIVATE_DESIGNS = frozenset({"pencil-cafecitos"})


def default_design(design: str | None) -> str:
    """Resolve an omitted legacy design to the stable default."""
    return design if design in DESIGN_SPECS else "store"


def supported_blocks(design: str | None) -> set[str]:
    return set(DESIGN_SPECS[default_design(design)]["blocks"])


def public_design_specs() -> list[dict[str, Any]]:
    return [
        {"id": design, **spec}
        for design, spec in DESIGN_SPECS.items()
        if design not in PRIVATE_DESIGNS
    ]
