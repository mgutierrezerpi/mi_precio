from peewee import CharField, TextField, ForeignKeyField
from models.base import BaseModel
from models.tenant import Tenant


class Activity(BaseModel):
    """An audit/activity entry for a tenant (who did what), shown in the live feed."""

    tenant = ForeignKeyField(Tenant, backref="activities", on_delete="CASCADE")
    actor = CharField(max_length=255, null=True)      # display label of the user (email)
    actor_id = CharField(max_length=32, null=True)
    action = CharField(max_length=50, index=True)     # e.g. "product.created"
    summary = TextField()                             # pre-rendered Spanish text (fallback)
    # JSON of the dynamic values (name, email, amount…) so the client can rebuild
    # the text per locale from `action` + `meta`. Null for pre-i18n rows.
    meta = TextField(null=True)
    entity_type = CharField(max_length=30, null=True)
    entity_id = CharField(max_length=32, null=True)

    class Meta:
        table_name = "activities"
