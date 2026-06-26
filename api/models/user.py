from peewee import BooleanField, CharField, ForeignKeyField, DateTimeField, TextField
from models.base import BaseModel
from models.tenant import Tenant

# Team roles, from most to least privileged. "owner" is the tenant creator.
ROLES = ("owner", "admin", "editor", "viewer")


class User(BaseModel):
    email = CharField(max_length=255, unique=True, index=True)
    tenant = ForeignKeyField(Tenant, backref="users", on_delete="CASCADE")
    name = CharField(max_length=255, null=True)
    role = CharField(max_length=20, default="owner")
    last_seen_at = DateTimeField(null=True)
    # In-app notifications: JSON of enabled categories + when the user last opened the bell.
    notif_prefs = TextField(null=True)
    notifications_seen_at = DateTimeField(null=True)
    simple_admin_ui = BooleanField(default=False)
    admin_ui_mode = CharField(max_length=16, default="full")

    class Meta:
        table_name = "users"

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.lower()
        return super().save(*args, **kwargs)
