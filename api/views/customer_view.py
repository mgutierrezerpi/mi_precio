from datetime import datetime
from decimal import Decimal
from pydantic import field_serializer
from views.base_view import BaseView


class CustomerView(BaseView):
    id: str
    tenant_id: str
    name: str
    rut: str | None
    email: str | None
    phone: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
    # Aggregates attached by the context (default to empty for un-annotated instances).
    orders_count: int = 0
    total_spent: Decimal = Decimal(0)
    last_order_at: datetime | None = None

    @field_serializer("total_spent")
    def serialize_total_spent(self, v):
        return str(v)

    @classmethod
    def render(cls, customer):
        return cls.model_validate(customer)

    @classmethod
    def render_many(cls, customers):
        return [cls.render(c) for c in customers]
