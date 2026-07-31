"""Per-list appearance overrides: each list can pick its own design, hero colour
and background. NULL means "inherit the tenant-wide default".
"""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "lists",
        design=pw.CharField(max_length=32, null=True),
        hero_color=pw.CharField(max_length=9, null=True),
        bg_url=pw.TextField(null=True),
        bg_overlay=pw.BooleanField(null=True),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("lists", "design", "hero_color", "bg_url", "bg_overlay")
