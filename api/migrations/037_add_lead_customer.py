"""Allow a lead submission to be linked to an existing CRM customer."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields("leads", customer_id=pw.CharField(max_length=32, null=True))
    migrator.add_index("leads", ("customer_id",), unique=False)


def rollback(migrator, database, fake=False, **kwargs):
    migrator.drop_index("leads", "lead_customer_id")
    migrator.remove_fields("leads", "customer_id")
