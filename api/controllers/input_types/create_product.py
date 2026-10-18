from pydantic import BaseModel

from controllers.input_types.catalog_fields import CatalogName, Price
from controllers.input_types.currency import Currency


class CreateProduct(BaseModel):
    name: CatalogName
    price: Price
    sku: str | None = None
    currency: Currency = "UYU"
    available: bool = True
    description: str | None = None
    image_url: str | None = None
    image_thumb_url: str | None = None
    category: str | None = None
