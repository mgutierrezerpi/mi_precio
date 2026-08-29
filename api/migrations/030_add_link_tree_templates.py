"""Allow each business Linktree to select a reusable visual template."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "link_trees",
        template=pw.CharField(max_length=32, default="botanical"),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("link_trees", "template")
