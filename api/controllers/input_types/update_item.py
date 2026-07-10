from pydantic import BaseModel


class UpdateItem(BaseModel):
    name: str | None = None
    price: float | None = None
    currency: str | None = None
    description: str | None = None
    image_url: str | None = None
    image_thumb_url: str | None = None
    category: str | None = None
