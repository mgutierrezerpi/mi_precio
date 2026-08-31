"""Store the opt-in viewer cookie identifier and latest client IP."""


def migrate(migrator, database, fake=False, **kwargs):
    database.execute_sql(
        "ALTER TABLE public_viewers ADD COLUMN visitor_token VARCHAR(64)"
    )
    database.execute_sql(
        "ALTER TABLE public_viewers ADD COLUMN ip_address VARCHAR(64)"
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS public_viewers_visitor_token "
        "ON public_viewers(visitor_token)"
    )


def rollback(migrator, database, fake=False, **kwargs):
    database.execute_sql("DROP INDEX IF EXISTS public_viewers_visitor_token")
    database.execute_sql("ALTER TABLE public_viewers DROP COLUMN ip_address")
    database.execute_sql("ALTER TABLE public_viewers DROP COLUMN visitor_token")
