"""Store the selected type direction for each Linktree."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields("link_trees", font=pw.CharField(max_length=32, default="sans"))


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("link_trees", "font")
