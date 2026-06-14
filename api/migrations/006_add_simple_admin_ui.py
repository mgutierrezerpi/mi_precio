"""Add per-user simplified admin UI flag."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "users",
        simple_admin_ui=pw.BooleanField(default=False),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("users", "simple_admin_ui")
