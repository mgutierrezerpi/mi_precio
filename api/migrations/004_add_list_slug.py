"""Add public slug field to lists."""

import re
import unicodedata

import peewee as pw


def slugify_list_name(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "_", normalized.lower()).strip("_")
    return slug or "lista"


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "lists",
        slug=pw.CharField(max_length=255, null=True, index=True),
    )

    used_slugs: dict[str, set[str]] = {}
    rows = database.execute_sql("SELECT id, tenant_id, name FROM lists").fetchall()
    for list_id, tenant_id, name in rows:
        base = slugify_list_name(name)
        slug = base
        counter = 2
        tenant_slugs = used_slugs.setdefault(tenant_id, set())
        while slug in tenant_slugs:
            slug = f"{base}_{counter}"
            counter += 1
        tenant_slugs.add(slug)
        database.execute_sql("UPDATE lists SET slug = ? WHERE id = ?", (slug, list_id))


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("lists", "slug")
