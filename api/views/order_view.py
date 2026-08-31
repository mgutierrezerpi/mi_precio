from datetime import datetime
from decimal import Decimal
from pydantic import field_serializer
from views.base_view import BaseView
from views.order_item_view import OrderItemView


class OrderView(BaseView):
    id: str
    tenant_id: str
    customer_id: str
    reference: str | None
    total: Decimal
    currency: str
    status: str
    note: str | None
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemView] = []

    @field_serializer("total")
    def serialize_total(self, v):
        return str(v)

    @classmethod
    def render(cls, order):
        view = cls.model_validate(order)
        view.items = OrderItemView.render_many(order.items)
        return view

    @classmethod
    def render_many(cls, orders):
        return [cls.render(o) for o in orders]
