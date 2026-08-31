"""Create one configurable Linktree page per business."""


def migrate(migrator, database, fake=False, **kwargs):
    database.execute_sql(
        """
        CREATE TABLE IF NOT EXISTS link_trees (
            id VARCHAR(32) PRIMARY KEY,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            tenant_id VARCHAR(32) NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
            display_name VARCHAR(255) NOT NULL,
            handle VARCHAR(255),
            bio TEXT,
            avatar_url TEXT,
            accent_color VARCHAR(9) NOT NULL DEFAULT '#D6EE4A',
            background_color VARCHAR(9) NOT NULL DEFAULT '#F5F4ED',
            tags TEXT NOT NULL DEFAULT '[]',
            links TEXT NOT NULL DEFAULT '[]',
            instagram_url TEXT,
            whatsapp_url TEXT,
            website_url TEXT,
            location_url TEXT,
            published INTEGER NOT NULL DEFAULT 1
        )
        """
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS link_trees_tenant_id ON link_trees(tenant_id)"
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS link_trees_published ON link_trees(published)"
    )


def rollback(migrator, database, fake=False, **kwargs):
    database.execute_sql("DROP INDEX IF EXISTS link_trees_published")
    database.execute_sql("DROP INDEX IF EXISTS link_trees_tenant_id")
    database.execute_sql("DROP TABLE IF EXISTS link_trees")
