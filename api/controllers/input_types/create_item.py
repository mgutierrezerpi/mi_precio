from pydantic import BaseModel


class CreateItem(BaseModel):
    name: str
    price: float
    currency: str = "UYU"
    description: str | None = None
    image_url: str | None = None
    category: str | None = None
