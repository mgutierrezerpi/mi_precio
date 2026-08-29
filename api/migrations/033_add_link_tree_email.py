"""Add an email destination to Linktree social shortcuts."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields("link_trees", email_url=pw.TextField(null=True))


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("link_trees", "email_url")
