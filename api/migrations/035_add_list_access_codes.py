"""Add optional protected-list codes and their CRM attribution."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "lists",
        access_code_hash=pw.CharField(max_length=255, null=True),
        access_customer_id=pw.CharField(max_length=32, null=True),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("lists", "access_code_hash", "access_customer_id")
