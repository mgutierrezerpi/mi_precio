from peewee import ForeignKeyField

from models.base import BaseModel
from models.customer import Customer
from models.price_list import PriceList


class CustomerListAccess(BaseModel):
    """A customer's explicit permission to open one private price list."""

    customer = ForeignKeyField(Customer, backref="private_list_accesses", on_delete="CASCADE")
    price_list = ForeignKeyField(PriceList, backref="customer_accesses", on_delete="CASCADE")

    class Meta:
        table_name = "customer_list_accesses"
        indexes = ((('customer', 'price_list'), True),)
