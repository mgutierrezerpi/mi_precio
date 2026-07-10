from peewee import CharField, TextField, DecimalField, IntegerField, BooleanField, ForeignKeyField
from models.base import BaseModel
from models.tenant import Tenant


class Product(BaseModel):
    """Tenant-level product catalog entry (independent of price lists)."""

    tenant = ForeignKeyField(Tenant, backref="products", on_delete="CASCADE")
    name = CharField(max_length=255)
    sku = CharField(max_length=64, null=True)
    price = DecimalField(decimal_places=2, auto_round=True)
    currency = CharField(max_length=3, default="UYU")
    available = BooleanField(default=True)
    description = TextField(null=True)
    image_url = TextField(null=True)
    image_thumb_url = TextField(null=True)
    category = CharField(max_length=100, null=True)
    position = IntegerField(default=0)

    class Meta:
        table_name = "products"
