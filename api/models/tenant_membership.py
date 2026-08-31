from datetime import datetime
from peewee import CharField, DateTimeField, ForeignKeyField, CompositeKey, Model

from models.base import db
from models.tenant import Tenant
from models.user import User


class TenantMembership(Model):
    """A user's role in a tenant. Users can belong to multiple tenants."""

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    user = ForeignKeyField(User, backref="tenant_memberships", on_delete="CASCADE")
    tenant = ForeignKeyField(Tenant, backref="memberships", on_delete="CASCADE")
    role = CharField(max_length=20, default="viewer")

    class Meta:
        table_name = "tenant_memberships"
        primary_key = CompositeKey("user", "tenant")
        database = db

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
