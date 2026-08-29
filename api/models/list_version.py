from peewee import (
    BooleanField,
    CharField,
    DateTimeField,
    ForeignKeyField,
    IntegerField,
    TextField,
)

from models.base import BaseModel
from models.price_list import PriceList


class ListVersion(BaseModel):
    list = ForeignKeyField(PriceList, backref="versions", on_delete="CASCADE")
    version_number = IntegerField(default=1)
    name = CharField(max_length=255)
    published = BooleanField(default=False, index=True)
    published_at = DateTimeField(null=True)
    # A serialized, validated public-list content document. Null deliberately
    # means legacy category-derived rendering.
    content = TextField(null=True)
    content_revision = IntegerField(default=0)

    class Meta:
        table_name = "list_versions"
