from peewee import CharField, BooleanField, ForeignKeyField
from models.base import BaseModel
from models.tenant import Tenant


class PriceList(BaseModel):
    tenant = ForeignKeyField(Tenant, backref="lists", on_delete="CASCADE")
    name = CharField(max_length=255)
    published = BooleanField(default=False, index=True)
    show_on_index = BooleanField(default=False, index=True)

    class Meta:
        table_name = "lists"
