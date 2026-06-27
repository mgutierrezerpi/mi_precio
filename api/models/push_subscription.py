from peewee import CharField, TextField, ForeignKeyField
from models.base import BaseModel
from models.tenant import Tenant
from models.user import User


class PushSubscription(BaseModel):
    """A Web Push (PWA) subscription for a user's device/browser.

    One user can have several (phone, laptop, ...). `endpoint` is the push
    service URL and is unique per device; `p256dh` + `auth` are the keys the
    browser hands us to encrypt the payload. Pushes are sent per-user, so we
    keep the tenant too for cheap fan-out when tenant activity happens."""

    tenant = ForeignKeyField(Tenant, backref="push_subscriptions", on_delete="CASCADE")
    user = ForeignKeyField(User, backref="push_subscriptions", on_delete="CASCADE")
    endpoint = TextField(unique=True)
    p256dh = CharField(max_length=255)
    auth = CharField(max_length=255)

    class Meta:
        table_name = "push_subscriptions"
