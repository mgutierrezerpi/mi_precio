from pydantic import BaseModel, Field, field_validator

from controllers.input_types.create_magazine import MAGAZINE_DESIGNS


class UpdateMagazine(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = Field(default=None, max_length=255)
    issue: str | None = Field(default=None, max_length=255)
    description: str | None = None
    design: str | None = None
    cover_image_url: str | None = None
    published: bool | None = None
    show_on_index: bool | None = None

    @field_validator("design")
    @classmethod
    def validate_design(cls, value: str | None) -> str | None:
        if value is not None and value not in MAGAZINE_DESIGNS:
            raise ValueError(f"design must be one of {sorted(MAGAZINE_DESIGNS)}")
        return value
