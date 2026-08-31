"""Validation and serialization for versioned public-list content."""

import json
from typing import Any

from lib.list_content_template import validate_template
from lib.list_designs import supported_blocks

MAX_DOCUMENT_BYTES = 50_000


def deserialize_content(content: str | None) -> dict[str, Any] | None:
    if content is None:
        return None
    return json.loads(content)


def serialize_content(content: dict[str, Any], design: str | None) -> str:
    """Validate and produce stable JSON for a version content snapshot."""
    _validate_document(content, supported_blocks(design))
    serialized = json.dumps(content, ensure_ascii=False, separators=(",", ":"))
    if len(serialized.encode("utf-8")) > MAX_DOCUMENT_BYTES:
        raise ValueError("content exceeds the 50 KB limit")
    return serialized


def _validate_document(content: dict[str, Any], allowed_blocks: set[str]) -> None:
    if set(content) - {"schema_version", "hero", "template", "blocks"}:
        raise ValueError("content has unknown fields")
    if content.get("schema_version") != 1:
        raise ValueError("content.schema_version must be 1")
    _validate_hero(content.get("hero"))
    validate_template(content.get("template"))
    blocks = content.get("blocks")
    if not isinstance(blocks, list):
        raise TypeError("content.blocks must be a list")
    block_ids: set[str] = set()
    for block in blocks:
        if not isinstance(block, dict):
            raise TypeError("each content block must be an object")
        block_id = _required_string(block, "id", "block")
        if block_id in block_ids:
            raise ValueError("content block ids must be unique")
        block_ids.add(block_id)
        block_type = _required_string(block, "type", "block")
        if block_type not in allowed_blocks:
            raise ValueError(
                f"block type {block_type!r} is not supported by this design"
            )
        if block_type == "catalog":
            _validate_catalog(block)
        elif block_type == "promotion_strip":
            _validate_promotion_strip(block)
        elif block_type == "contact":
            _validate_contact(block)


def _validate_hero(hero: Any) -> None:
    if hero is None:
        return
    if not isinstance(hero, dict) or set(hero) - {"eyebrow", "title", "body", "stats"}:
        raise ValueError("content.hero has unknown fields")
    for key in ("eyebrow", "title", "body"):
        if key in hero:
            _string(hero[key], f"content.hero.{key}", allow_empty=True)
    if "stats" in hero:
        if not isinstance(hero["stats"], list):
            raise ValueError("content.hero.stats must be a list")
        for stat in hero["stats"]:
            if not isinstance(stat, dict) or set(stat) != {"value", "label"}:
                raise ValueError("each hero stat needs value and label")
            _string(stat["value"], "hero stat value")
            _string(stat["label"], "hero stat label")


def _validate_catalog(block: dict[str, Any]) -> None:
    if set(block) - {"id", "type", "sections"}:
        raise ValueError("catalog block has unknown fields")
    sections = block.get("sections")
    if not isinstance(sections, list):
        raise TypeError("catalog.sections must be a list")
    section_ids: set[str] = set()
    for section in sections:
        if not isinstance(section, dict) or set(section) - {
            "id",
            "title",
            "body",
            "source",
        }:
            raise ValueError("catalog section has unknown fields")
        section_id = _required_string(section, "id", "section")
        if section_id in section_ids:
            raise ValueError("catalog section ids must be unique")
        section_ids.add(section_id)
        _required_string(section, "title", "section")
        if "body" in section:
            _string(section["body"], "section body")
        source = section.get("source")
        if not isinstance(source, dict) or source != {
            "kind": "category",
            "value": source.get("value"),
        }:
            raise ValueError("section source must be a category source")
        _string(source["value"], "section source value")


def _validate_promotion_strip(block: dict[str, Any]) -> None:
    if set(block) != {"id", "type", "items"} or not isinstance(
        block.get("items"), list
    ):
        raise ValueError("promotion_strip needs an items list")
    for item in block["items"]:
        _string(item, "promotion item")


def _validate_contact(block: dict[str, Any]) -> None:
    if set(block) - {"id", "type", "show_whatsapp", "hours"}:
        raise ValueError("contact block has unknown fields")
    if "show_whatsapp" in block and not isinstance(block["show_whatsapp"], bool):
        raise ValueError("contact.show_whatsapp must be a boolean")
    if "hours" in block:
        if not isinstance(block["hours"], list):
            raise ValueError("contact.hours must be a list")
        for hours in block["hours"]:
            if not isinstance(hours, dict) or set(hours) != {"days", "hours"}:
                raise ValueError("each contact hour needs days and hours")
            _string(hours["days"], "contact days")
            _string(hours["hours"], "contact hours")


def _required_string(data: dict[str, Any], key: str, label: str) -> str:
    if key not in data:
        raise ValueError(f"{label}.{key} is required")
    return _string(data[key], f"{label}.{key}")


def _string(value: Any, label: str, *, allow_empty: bool = False) -> str:
    if not isinstance(value, str) or (not allow_empty and not value.strip()):
        raise ValueError(f"{label} must be a non-empty string")
    if len(value) > 2_000:
        raise ValueError(f"{label} is too long")
    return value
