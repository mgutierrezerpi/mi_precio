from pydantic import BaseModel


class UpdateProduct(BaseModel):
    name: str | None = None
    price: float | None = None
    sku: str | None = None
    currency: str | None = None
    available: bool | None = None
    description: str | None = None
    image_url: str | None = None
    category: str | None = None
    price_list_ids: list[str] | None = None
