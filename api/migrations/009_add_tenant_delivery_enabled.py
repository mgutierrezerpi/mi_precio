"""Add delivery_enabled field to tenants table."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "tenants",
        delivery_enabled=pw.BooleanField(default=False),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("tenants", "delivery_enabled")
