"""Add the versioned public-list content document."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "list_versions",
        content=pw.TextField(null=True),
        content_revision=pw.IntegerField(default=0),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("list_versions", "content", "content_revision")
