"""Add the one-time, cardless tenant trial."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "tenants",
        trial_started_at=pw.DateTimeField(null=True),
        trial_ends_at=pw.DateTimeField(null=True),
        trial_ending_notified_at=pw.DateTimeField(null=True),
        trial_expired_notified_at=pw.DateTimeField(null=True),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields(
        "tenants",
        "trial_started_at",
        "trial_ends_at",
        "trial_ending_notified_at",
        "trial_expired_notified_at",
    )
