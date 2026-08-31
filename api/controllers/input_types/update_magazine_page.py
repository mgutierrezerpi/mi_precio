from pydantic import BaseModel, Field


class UpdateMagazinePage(BaseModel):
    position: int | None = Field(default=None, ge=0)
    page_type: str | None = Field(default=None, max_length=32)
    title: str | None = Field(default=None, max_length=255)
    image_url: str | None = None
    content: dict | None = None
