from peewee import CharField, TextField, DecimalField, ForeignKeyField
from models.base import BaseModel
from models.tenant import Tenant
from models.customer import Customer


class Order(BaseModel):
    """A purchase made by a customer (its `created_at` is the purchase date)."""

    tenant = ForeignKeyField(Tenant, backref="orders", on_delete="CASCADE")
    customer = ForeignKeyField(Customer, backref="orders", on_delete="CASCADE")
    reference = CharField(max_length=64, null=True)  # order / invoice number
    total = DecimalField(decimal_places=2, auto_round=True, default=0)
    currency = CharField(max_length=3, default="UYU")
    status = CharField(max_length=20, default="paid")  # paid | pending | cancelled
    note = TextField(null=True)

    class Meta:
        table_name = "orders"
