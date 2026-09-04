"""Attribute public visits to an identified CRM customer when available."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields("page_views", customer_id=pw.CharField(max_length=32, null=True))
    migrator.add_index("page_views", ("customer_id",), unique=False)


def rollback(migrator, database, fake=False, **kwargs):
    migrator.drop_index("page_views", "pageview_customer_id")
    migrator.remove_fields("page_views", "customer_id")
