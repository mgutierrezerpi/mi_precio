"""Add currency field to tenants table."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "tenants",
        currency=pw.CharField(max_length=3, default="UYU"),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("tenants", "currency")
