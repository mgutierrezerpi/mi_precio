from pydantic import BaseModel

from controllers.input_types.currency import Currency


class UpdateItem(BaseModel):
    name: str | None = None
    price: float | None = None
    currency: Currency | None = None
    description: str | None = None
    image_url: str | None = None
    image_thumb_url: str | None = None
    category: str | None = None
