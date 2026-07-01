from peewee import CharField, TextField, DecimalField, IntegerField, DeferredForeignKey
from models.base import BaseModel


class Item(BaseModel):
    list_version = DeferredForeignKey("ListVersion", backref="items", on_delete="CASCADE")
    # The catalog product this item was created from, when applicable. Lets the list
    # editor track membership by a stable id instead of the (mutable) name. Nullable:
    # items can be typed by hand or imported, and a deleted product leaves the snapshot.
    product = DeferredForeignKey("Product", null=True, backref="items", on_delete="SET NULL")
    name = CharField(max_length=255)
    price = DecimalField(decimal_places=2, auto_round=True)
    currency = CharField(max_length=3, default="UYU")
    description = TextField(null=True)
    position = IntegerField(default=0)
    image_url = CharField(max_length=500, null=True)
    category = CharField(max_length=100, null=True)  # For grouping items (e.g., "Bebidas", "Postres")

    class Meta:
        table_name = "items"
