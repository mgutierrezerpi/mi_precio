from pydantic import BaseModel, Field


class CreateMagazinePage(BaseModel):
    position: int = Field(ge=0)
    page_type: str = Field(default="editorial", max_length=32)
    title: str | None = Field(default=None, max_length=255)
    image_url: str | None = None
    content: dict | None = None
