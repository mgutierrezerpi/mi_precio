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
    access_code_enabled: bool = False
    access_list_ids: list[str] = []
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
        view = cls.model_validate(customer)
        view.access_code_enabled = bool(getattr(customer, "access_code_hash", None))
        from models import CustomerListAccess
        view.access_list_ids = [
            grant.price_list_id
            for grant in CustomerListAccess.select().where(
                CustomerListAccess.customer == customer.id
            )
        ]
        return view

    @classmethod
    def render_many(cls, customers):
        return [cls.render(c) for c in customers]
