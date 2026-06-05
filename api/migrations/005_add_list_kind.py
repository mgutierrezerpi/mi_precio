"""Add kind field to lists (product | service)."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "lists",
        kind=pw.CharField(max_length=20, default="product"),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("lists", "kind")
