"""Aggregate anonymous dismissals of the public viewer prompt."""


def migrate(migrator, database, fake=False, **kwargs):
    database.execute_sql(
        """
        CREATE TABLE IF NOT EXISTS public_viewer_dismissals (
            id VARCHAR(32) PRIMARY KEY,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            tenant_id VARCHAR(32) NOT NULL,
            price_list_id VARCHAR(32) NOT NULL,
            dismissal_count INTEGER NOT NULL DEFAULT 0,
            last_seen_at DATETIME NOT NULL,
            UNIQUE (tenant_id, price_list_id)
        )
        """
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS public_viewer_dismissals_tenant_id "
        "ON public_viewer_dismissals(tenant_id)"
    )


def rollback(migrator, database, fake=False, **kwargs):
    database.execute_sql("DROP INDEX IF EXISTS public_viewer_dismissals_tenant_id")
    database.execute_sql("DROP TABLE IF EXISTS public_viewer_dismissals")
