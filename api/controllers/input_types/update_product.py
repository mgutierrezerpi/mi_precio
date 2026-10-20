from pydantic import BaseModel, model_validator

from controllers.input_types.catalog_fields import CatalogName, Price, reject_nulls
from controllers.input_types.currency import Currency


class UpdateProduct(BaseModel):
    name: CatalogName | None = None
    price: Price | None = None
    sku: str | None = None
    currency: Currency | None = None
    available: bool | None = None
    description: str | None = None
    image_url: str | None = None
    image_thumb_url: str | None = None
    category: str | None = None
    price_list_ids: list[str] | None = None

    @model_validator(mode="before")
    @classmethod
    def no_nulls_for_required_columns(cls, data: object) -> object:
        return reject_nulls(data, ("name", "price", "currency", "available"))
