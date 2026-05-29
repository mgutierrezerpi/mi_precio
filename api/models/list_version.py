from peewee import CharField, BooleanField, DateTimeField, IntegerField, ForeignKeyField
from models.base import BaseModel
from models.price_list import PriceList


class ListVersion(BaseModel):
    list = ForeignKeyField(PriceList, backref="versions", on_delete="CASCADE")
    version_number = IntegerField(default=1)
    name = CharField(max_length=255)
    published = BooleanField(default=False, index=True)
    published_at = DateTimeField(null=True)

    class Meta:
        table_name = "list_versions"
