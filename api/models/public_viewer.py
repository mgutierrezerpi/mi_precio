from datetime import datetime

from peewee import DateTimeField, ForeignKeyField, IntegerField, CharField

from models.base import BaseModel
from models.price_list import PriceList
from models.tenant import Tenant


class PublicViewer(BaseModel):
    """A contact who chose to identify themselves while viewing a public list."""

    tenant = ForeignKeyField(Tenant, backref="public_viewers", on_delete="CASCADE")
    price_list = ForeignKeyField(
        PriceList, backref="public_viewers", on_delete="CASCADE"
    )
    name = CharField(max_length=255)
    email = CharField(max_length=255, null=True)
    phone = CharField(max_length=50, null=True)
    # Deliberately stored as an id rather than a Peewee FK: viewer capture is
    # optional, and customer deletion should not require this table to exist.
    customer_id = CharField(max_length=32, null=True)
    visitor_token = CharField(max_length=64, null=True)
    ip_address = CharField(max_length=64, null=True)
    view_count = IntegerField(default=1)
    last_seen_at = DateTimeField(default=datetime.utcnow)

    class Meta:
        table_name = "public_viewers"
