from decimal import Decimal
from pydantic import field_serializer
from views.base_view import BaseView


class OrderItemView(BaseView):
    id: str
    name: str
    quantity: int
    unit_price: Decimal

    @field_serializer("unit_price")
    def serialize_unit_price(self, v):
        return str(v)

    @classmethod
    def render(cls, item):
        return cls.model_validate(item)

    @classmethod
    def render_many(cls, items):
        return [cls.render(i) for i in items]
