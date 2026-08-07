"""Add opt-in marketplace discovery and saved business coordinates."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "tenants",
        marketplace_enabled=pw.BooleanField(default=False),
        marketplace_latitude=pw.CharField(max_length=32, null=True),
        marketplace_longitude=pw.CharField(max_length=32, null=True),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields(
        "tenants",
        "marketplace_enabled",
        "marketplace_latitude",
        "marketplace_longitude",
    )
