from pydantic import BaseModel


class OrderItemInput(BaseModel):
    name: str
    quantity: int = 1
    unit_price: float = 0


class CreateOrder(BaseModel):
    items: list[OrderItemInput] = []
    status: str = "paid"
    note: str | None = None
    currency: str | None = None
    reference: str | None = None
