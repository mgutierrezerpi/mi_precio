from peewee import BooleanField, CharField, ForeignKeyField, TextField

from models.base import BaseModel
from models.tenant import Tenant


class LinkTree(BaseModel):
    """The public link-in-bio page owned by one business."""

    tenant = ForeignKeyField(
        Tenant, backref="link_tree", on_delete="CASCADE", unique=True, index=True
    )
    display_name = CharField(max_length=255)
    handle = CharField(max_length=255, null=True)
    bio = TextField(null=True)
    avatar_url = TextField(null=True)
    accent_color = CharField(max_length=9, default="#D6EE4A")
    background_color = CharField(max_length=9, default="#F5F4ED")
    template = CharField(max_length=32, default="botanical")
    tags = TextField(default="[]")
    links = TextField(default="[]")
    instagram_url = TextField(null=True)
    whatsapp_url = TextField(null=True)
    website_url = TextField(null=True)
    location_url = TextField(null=True)
    published = BooleanField(default=True, index=True)

    class Meta:
        table_name = "link_trees"
