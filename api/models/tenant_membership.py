from peewee import CharField, CompositeKey, DateTimeField, ForeignKeyField, Model

from models.base import db, utc_now
from models.tenant import Tenant
from models.user import User


class TenantMembership(Model):
    """A user's role in a tenant. Users can belong to multiple tenants."""

    created_at = DateTimeField(default=utc_now)
    updated_at = DateTimeField(default=utc_now)
    user = ForeignKeyField(User, backref="tenant_memberships", on_delete="CASCADE")
    tenant = ForeignKeyField(Tenant, backref="memberships", on_delete="CASCADE")
    role = CharField(max_length=20, default="viewer")

    class Meta:
        table_name = "tenant_memberships"
        primary_key = CompositeKey("user", "tenant")
        database = db

    def save(self, *args, **kwargs):
        self.updated_at = utc_now()
        return super().save(*args, **kwargs)
