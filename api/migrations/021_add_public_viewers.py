"""Allow public lists to collect optional viewer contact details."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "lists",
        capture_viewer_info=pw.BooleanField(default=False),
    )
    database.execute_sql(
        """
        CREATE TABLE IF NOT EXISTS public_viewers (
            id VARCHAR(32) PRIMARY KEY,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            tenant_id VARCHAR(32) NOT NULL,
            price_list_id VARCHAR(32) NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            view_count INTEGER NOT NULL DEFAULT 1,
            last_seen_at DATETIME NOT NULL
        )
        """
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS public_viewers_tenant_id ON public_viewers(tenant_id)"
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS public_viewers_price_list_id ON public_viewers(price_list_id)"
    )


def rollback(migrator, database, fake=False, **kwargs):
    database.execute_sql("DROP INDEX IF EXISTS public_viewers_tenant_id")
    database.execute_sql("DROP INDEX IF EXISTS public_viewers_price_list_id")
    database.execute_sql("DROP TABLE IF EXISTS public_viewers")
    migrator.remove_fields("lists", "capture_viewer_info")
