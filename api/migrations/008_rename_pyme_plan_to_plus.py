"""Rename legacy pyme plan values to plus."""


def migrate(migrator, database, fake=False, **kwargs):
    database.execute_sql("UPDATE tenants SET plan = 'plus' WHERE plan = 'pyme'")


def rollback(migrator, database, fake=False, **kwargs):
    database.execute_sql("UPDATE tenants SET plan = 'pyme' WHERE plan = 'plus'")
