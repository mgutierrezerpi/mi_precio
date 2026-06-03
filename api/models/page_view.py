from peewee import ForeignKeyField, CharField
from models.base import BaseModel
from models.tenant import Tenant


class PageView(BaseModel):
    """A visit to a tenant's public price-list page."""

    tenant = ForeignKeyField(Tenant, backref="page_views", on_delete="CASCADE")
    list_id = CharField(max_length=32, null=True)

    class Meta:
        table_name = "page_views"
