"""Add category field to items table for grouping."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "items",
        category=pw.CharField(max_length=100, null=True),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("items", "category")
