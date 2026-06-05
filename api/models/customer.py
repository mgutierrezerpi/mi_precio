from peewee import CharField, TextField, ForeignKeyField
from models.base import BaseModel
from models.tenant import Tenant


class Customer(BaseModel):
    """A tenant's customer (CRM contact with a purchase history)."""

    tenant = ForeignKeyField(Tenant, backref="customers", on_delete="CASCADE")
    name = CharField(max_length=255)
    rut = CharField(max_length=32, null=True)
    email = CharField(max_length=255, null=True)
    phone = CharField(max_length=50, null=True)
    notes = TextField(null=True)

    class Meta:
        table_name = "customers"
