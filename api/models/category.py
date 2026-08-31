from peewee import CharField, TextField, IntegerField, ForeignKeyField
from models.base import BaseModel
from models.tenant import Tenant


class Category(BaseModel):
    """Tenant-level product category (metadata; products reference it by name)."""

    tenant = ForeignKeyField(Tenant, backref="categories", on_delete="CASCADE")
    name = CharField(max_length=100)
    description = TextField(null=True)
    color = CharField(max_length=20, null=True)  # tone key, e.g. "violet"
    position = IntegerField(default=0)

    class Meta:
        table_name = "categories"
