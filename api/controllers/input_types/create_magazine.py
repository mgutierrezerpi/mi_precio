from pydantic import BaseModel, Field, field_validator

MAGAZINE_DESIGNS = {
    "pencil-journal",
    "wild-stem",
    "aqua-objects",
    "editorial",
    "catalog",
}


class CreateMagazine(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    issue: str | None = Field(default=None, max_length=255)
    description: str | None = None
    design: str = "pencil-journal"
    cover_image_url: str | None = None
    published: bool = False
    show_on_index: bool = False

    @field_validator("design")
    @classmethod
    def validate_design(cls, value: str) -> str:
        if value not in MAGAZINE_DESIGNS:
            raise ValueError(f"design must be one of {sorted(MAGAZINE_DESIGNS)}")
        return value
