from pydantic import field_serializer
from datetime import datetime
from decimal import Decimal
from views.base_view import BaseView


class ItemView(BaseView):
    id: str
    list_version_id: str
    name: str
    price: Decimal
    currency: str
    description: str | None
    position: int
    image_url: str | None
    category: str | None
    product_id: str | None = None
    created_at: datetime
    updated_at: datetime

    @field_serializer("price")
    def serialize_price(self, v):
        return str(v)

    @classmethod
    def render(cls, item):
        return cls.model_validate(item)

    @classmethod
    def render_many(cls, items):
        return [cls.render(i) for i in items]
