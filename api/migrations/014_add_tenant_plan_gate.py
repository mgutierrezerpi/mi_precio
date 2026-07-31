"""Add plan_gate to tenants: new signups must pick a paid plan before entering the CRM.

Default False, so tenants created before the gate existed keep their access.
"""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "tenants",
        plan_gate=pw.BooleanField(default=False),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("tenants", "plan_gate")
