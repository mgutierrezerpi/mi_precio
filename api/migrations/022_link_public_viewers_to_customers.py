"""Link identified public viewers to CRM customers after promotion."""


def migrate(migrator, database, fake=False, **kwargs):
    database.execute_sql(
        "ALTER TABLE public_viewers ADD COLUMN customer_id VARCHAR(32)"
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS public_viewers_customer_id ON public_viewers(customer_id)"
    )


def rollback(migrator, database, fake=False, **kwargs):
    database.execute_sql("DROP INDEX IF EXISTS public_viewers_customer_id")
    database.execute_sql("ALTER TABLE public_viewers DROP COLUMN customer_id")
