"""Add activities.meta (JSON of dynamic values for per-locale rendering)."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "activities",
        meta=pw.TextField(null=True),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("activities", "meta")
