import re
import unicodedata

from peewee import BooleanField, CharField, ForeignKeyField, TextField
from models.base import BaseModel
from models.tenant import Tenant


def slugify_list_name(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "_", normalized.lower()).strip("_")
    return slug or "lista"


def unique_list_slug(tenant_id: str, name: str, current_id: str | None = None) -> str:
    base = slugify_list_name(name)
    slug = base
    counter = 2

    while True:
        query = PriceList.select().where(
            (PriceList.tenant == tenant_id) & (PriceList.slug == slug)
        )
        if current_id:
            query = query.where(PriceList.id != current_id)
        if not query.exists():
            return slug
        slug = f"{base}_{counter}"
        counter += 1


class PriceList(BaseModel):
    tenant = ForeignKeyField(Tenant, backref="lists", on_delete="CASCADE")
    name = CharField(max_length=255)
    slug = CharField(max_length=255, null=True, index=True)
    published = BooleanField(default=False, index=True)
    show_on_index = BooleanField(default=False, index=True)
    # "product" lists show add-to-cart on the public page; "service" lists don't.
    kind = CharField(max_length=20, default="product")

    # Per-list appearance. Every field is optional and falls back to the
    # tenant-wide default (Tenant.list_design / list_hero_color / list_bg_*), so
    # a list only overrides what it explicitly sets.
    design = CharField(max_length=32, null=True)
    hero_color = CharField(max_length=9, null=True)
    bg_url = TextField(null=True)
    bg_overlay = BooleanField(null=True)

    class Meta:
        table_name = "lists"

    def save(self, *args, **kwargs):
        if self.name and not self.slug:
            self.slug = unique_list_slug(self.tenant_id, self.name, self.id)
        return super().save(*args, **kwargs)
