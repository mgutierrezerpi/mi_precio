"""Add platform feature flags and tenant-specific assignments."""


def migrate(migrator, database, fake=False, **kwargs):
    database.execute_sql(
        """
        CREATE TABLE IF NOT EXISTS feature_flags (
            id VARCHAR(32) PRIMARY KEY,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            key VARCHAR(128) NOT NULL UNIQUE,
            description TEXT,
            default_enabled INTEGER NOT NULL DEFAULT 0
        )
        """
    )
    database.execute_sql(
        """
        CREATE TABLE IF NOT EXISTS feature_flag_assignments (
            id VARCHAR(32) PRIMARY KEY,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            flag_id VARCHAR(32) NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
            tenant_id VARCHAR(32) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            enabled INTEGER NOT NULL DEFAULT 0,
            UNIQUE(flag_id, tenant_id)
        )
        """
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS feature_flag_assignments_flag_id "
        "ON feature_flag_assignments(flag_id)"
    )
    database.execute_sql(
        "CREATE INDEX IF NOT EXISTS feature_flag_assignments_tenant_id "
        "ON feature_flag_assignments(tenant_id)"
    )


def rollback(migrator, database, fake=False, **kwargs):
    database.execute_sql("DROP INDEX IF EXISTS feature_flag_assignments_tenant_id")
    database.execute_sql("DROP INDEX IF EXISTS feature_flag_assignments_flag_id")
    database.execute_sql("DROP TABLE IF EXISTS feature_flag_assignments")
    database.execute_sql("DROP TABLE IF EXISTS feature_flags")
