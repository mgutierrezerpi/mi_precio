"""Add items.product_id — link a list item back to the catalog product it came from."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "items",
        product_id=pw.CharField(max_length=32, null=True, index=True),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("items", "product_id")
