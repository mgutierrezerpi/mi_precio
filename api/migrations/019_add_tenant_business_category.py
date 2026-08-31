"""Add the category used to filter businesses in the marketplace."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields("tenants", business_category=pw.CharField(max_length=32, null=True))


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("tenants", "business_category")
