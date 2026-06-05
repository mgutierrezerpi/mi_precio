from peewee import CharField, DecimalField, IntegerField, ForeignKeyField
from models.base import BaseModel
from models.order import Order


class OrderItem(BaseModel):
    """A single line in a purchase (a product name, quantity and unit price)."""

    order = ForeignKeyField(Order, backref="items", on_delete="CASCADE")
    name = CharField(max_length=255)
    quantity = IntegerField(default=1)
    unit_price = DecimalField(decimal_places=2, auto_round=True, default=0)

    class Meta:
        table_name = "order_items"
