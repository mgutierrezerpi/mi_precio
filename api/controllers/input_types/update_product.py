from pydantic import BaseModel

from controllers.input_types.currency import Currency


class UpdateProduct(BaseModel):
    name: str | None = None
    price: float | None = None
    sku: str | None = None
    currency: Currency | None = None
    available: bool | None = None
    description: str | None = None
    image_url: str | None = None
    image_thumb_url: str | None = None
    category: str | None = None
    price_list_ids: list[str] | None = None
