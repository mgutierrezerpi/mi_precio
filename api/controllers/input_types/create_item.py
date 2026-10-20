from pydantic import BaseModel

from controllers.input_types.catalog_fields import CatalogName, Price
from controllers.input_types.currency import Currency


class CreateItem(BaseModel):
    name: CatalogName
    price: Price
    currency: Currency = "UYU"
    description: str | None = None
    image_url: str | None = None
    image_thumb_url: str | None = None
    category: str | None = None
    product_id: str | None = None
