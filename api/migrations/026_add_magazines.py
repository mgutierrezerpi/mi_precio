"""Create the magazine publication and ordered page tables."""


def migrate(migrator, database, fake=False, **kwargs):
    database.execute_sql(
        """
        CREATE TABLE IF NOT EXISTS magazines (
            id VARCHAR(32) PRIMARY KEY,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            tenant_id VARCHAR(32) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255),
            issue VARCHAR(255),
            description TEXT,
            design VARCHAR(32) NOT NULL DEFAULT 'pencil-journal',
            cover_image_url TEXT,
            published INTEGER NOT NULL DEFAULT 0,
            show_on_index INTEGER NOT NULL DEFAULT 0
        )
        """
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS magazines_tenant_id ON magazines(tenant_id)"
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS magazines_published ON magazines(published)"
    )
    database.execute_sql(
        """
        CREATE TABLE IF NOT EXISTS magazine_pages (
            id VARCHAR(32) PRIMARY KEY,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            magazine_id VARCHAR(32) NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
            position INTEGER NOT NULL DEFAULT 0,
            page_type VARCHAR(32) NOT NULL DEFAULT 'editorial',
            title VARCHAR(255),
            image_url TEXT,
            content TEXT,
            UNIQUE (magazine_id, position)
        )
        """
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS magazine_pages_magazine_id ON magazine_pages(magazine_id)"
    )


def rollback(migrator, database, fake=False, **kwargs):
    database.execute_sql("DROP INDEX IF EXISTS magazine_pages_magazine_id")
    database.execute_sql("DROP TABLE IF EXISTS magazine_pages")
    database.execute_sql("DROP INDEX IF EXISTS magazines_published")
    database.execute_sql("DROP INDEX IF EXISTS magazines_tenant_id")
    database.execute_sql("DROP TABLE IF EXISTS magazines")
