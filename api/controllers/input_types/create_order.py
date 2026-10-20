from pydantic import BaseModel, field_validator

from controllers.input_types.catalog_fields import CatalogName, Price
from controllers.input_types.currency import Currency

# Mirrors the comment on models.Order.status.
ORDER_STATUSES = ("paid", "pending", "cancelled")


def _check_status(value: str | None) -> str | None:
    if value is not None and value not in ORDER_STATUSES:
        raise ValueError("El estado tiene que ser pagada, pendiente o cancelada.")
    return value


class OrderItemInput(BaseModel):
    name: CatalogName
    quantity: int = 1
    unit_price: Price = 0

    @field_validator("quantity")
    @classmethod
    def _positive_quantity(cls, value: int) -> int:
        # A quantity of -3 used to save an order totalling -300.
        if not 1 <= value <= 10_000:
            raise ValueError("La cantidad tiene que ser entre 1 y 10.000.")
        return value


class CreateOrder(BaseModel):
    items: list[OrderItemInput] = []
    status: str = "paid"
    note: str | None = None
    currency: Currency | None = None
    reference: str | None = None

    @field_validator("status")
    @classmethod
    def _known_status(cls, value: str | None) -> str | None:
        return _check_status(value)


class UpdateOrder(BaseModel):
    items: list[OrderItemInput] | None = None
    status: str | None = None
    note: str | None = None
    reference: str | None = None

    @field_validator("status")
    @classmethod
    def _known_status(cls, value: str | None) -> str | None:
        return _check_status(value)
