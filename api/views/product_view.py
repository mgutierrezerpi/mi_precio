from pydantic import field_serializer
from datetime import datetime
from decimal import Decimal
from views.base_view import BaseView


class ProductView(BaseView):
    id: str
    tenant_id: str
    name: str
    sku: str | None
    price: Decimal
    currency: str
    available: bool
    description: str | None
    image_url: str | None
    category: str | None
    position: int
    created_at: datetime
    updated_at: datetime

    @field_serializer("price")
    def serialize_price(self, v):
        return str(v)

    @classmethod
    def render(cls, product):
        return cls.model_validate(product)

    @classmethod
    def render_many(cls, products):
        return [cls.render(p) for p in products]
