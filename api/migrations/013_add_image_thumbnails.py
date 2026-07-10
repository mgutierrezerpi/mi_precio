"""Add WebP thumbnail URLs for product and item images."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "products",
        image_thumb_url=pw.TextField(null=True),
    )
    migrator.add_fields(
        "items",
        image_thumb_url=pw.CharField(max_length=500, null=True),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("products", "image_thumb_url")
    migrator.remove_fields("items", "image_thumb_url")
