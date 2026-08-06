from pydantic import BaseModel, field_validator

from controllers.input_types.appearance import validate_design, validate_hex_color


class UpdateList(BaseModel):
    name: str | None = None
    slug: str | None = None
    published: bool | None = None
    show_on_index: bool | None = None
    kind: str | None = None
    # Assigning a parent turns an existing list into a nested special list.
    parent_list_id: str | None = None
    # Per-list appearance. Null clears the override and falls back to the tenant.
    design: str | None = None
    hero_color: str | None = None
    bg_url: str | None = None
    bg_overlay: bool | None = None

    @field_validator("design")
    @classmethod
    def validate_list_design(cls, v: str | None) -> str | None:
        return validate_design(v)

    @field_validator("hero_color")
    @classmethod
    def validate_list_hero_color(cls, v: str | None) -> str | None:
        return validate_hex_color(v, "Hero color")
