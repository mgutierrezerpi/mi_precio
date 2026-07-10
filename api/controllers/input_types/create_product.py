from pydantic import BaseModel


class CreateProduct(BaseModel):
    name: str
    price: float
    sku: str | None = None
    currency: str = "UYU"
    available: bool = True
    description: str | None = None
    image_url: str | None = None
    image_thumb_url: str | None = None
    category: str | None = None
