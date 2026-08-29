"""Add a platform-level super-admin flag to users."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "users",
        is_super_admin=pw.BooleanField(default=False, index=True),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("users", "is_super_admin")
