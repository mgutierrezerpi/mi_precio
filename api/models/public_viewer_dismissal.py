from datetime import datetime

from peewee import DateTimeField, ForeignKeyField, IntegerField

from models.base import BaseModel
from models.price_list import PriceList
from models.tenant import Tenant


class PublicViewerDismissal(BaseModel):
    """Aggregate count of visitors who dismissed an opt-in viewer prompt."""

    tenant = ForeignKeyField(Tenant, backref="+", on_delete="CASCADE")
    price_list = ForeignKeyField(PriceList, backref="+", on_delete="CASCADE")
    dismissal_count = IntegerField(default=0)
    last_seen_at = DateTimeField(default=datetime.utcnow)

    class Meta:
        table_name = "public_viewer_dismissals"
        indexes = ((("tenant", "price_list"), True),)
