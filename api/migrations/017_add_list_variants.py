"""Add nested price-list variants and their audience/schedule metadata."""


def migrate(migrator, database, fake=False, **kwargs):
    # This migration intentionally uses SQLite DDL directly. The installed
    # peewee-migrate version cannot apply indexed fields through `add_fields`.
    database.execute_sql("ALTER TABLE lists ADD COLUMN parent_list_id VARCHAR(32)")
    database.execute_sql("ALTER TABLE lists ADD COLUMN variant_type VARCHAR(20)")
    database.execute_sql("ALTER TABLE lists ADD COLUMN customer_id VARCHAR(32)")
    database.execute_sql("ALTER TABLE lists ADD COLUMN starts_at DATETIME")
    database.execute_sql("ALTER TABLE lists ADD COLUMN ends_at DATETIME")
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS lists_parent_list_id ON lists(parent_list_id)"
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS lists_customer_id ON lists(customer_id)"
    )


def rollback(migrator, database, fake=False, **kwargs):
    database.execute_sql("DROP INDEX IF EXISTS lists_parent_list_id")
    database.execute_sql("DROP INDEX IF EXISTS lists_customer_id")
    database.execute_sql("ALTER TABLE lists DROP COLUMN parent_list_id")
    database.execute_sql("ALTER TABLE lists DROP COLUMN variant_type")
    database.execute_sql("ALTER TABLE lists DROP COLUMN customer_id")
    database.execute_sql("ALTER TABLE lists DROP COLUMN starts_at")
    database.execute_sql("ALTER TABLE lists DROP COLUMN ends_at")
