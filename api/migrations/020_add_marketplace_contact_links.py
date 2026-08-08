"""Add public marketplace contact links for businesses."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "tenants",
        whatsapp_url=pw.TextField(null=True),
        website_url=pw.TextField(null=True),
        instagram_url=pw.TextField(null=True),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields(
        "tenants",
        "whatsapp_url",
        "website_url",
        "instagram_url",
    )
