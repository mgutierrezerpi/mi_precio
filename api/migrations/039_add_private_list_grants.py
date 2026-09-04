"""Make private lists explicit and grant customers access list by list."""


def migrate(migrator, database, fake=False, **kwargs):
    database.execute_sql(
        "ALTER TABLE lists ADD COLUMN is_private INTEGER NOT NULL DEFAULT 0"
    )
    database.execute_sql(
        """
        CREATE TABLE customer_list_accesses (
            id VARCHAR(32) PRIMARY KEY NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            customer_id VARCHAR(32) NOT NULL,
            price_list_id VARCHAR(32) NOT NULL,
            UNIQUE(customer_id, price_list_id)
        )
        """
    )
    database.execute_sql(
        "CREATE INDEX customer_list_accesses_customer_id ON customer_list_accesses(customer_id)"
    )
    database.execute_sql(
        "CREATE INDEX customer_list_accesses_price_list_id ON customer_list_accesses(price_list_id)"
    )
    # Existing configured list codes remain private and grant their linked
    # customer access, using the customer hash copied by migration 038.
    database.execute_sql(
        "UPDATE lists SET is_private = 1 WHERE access_code_hash IS NOT NULL AND access_customer_id IS NOT NULL"
    )
    database.execute_sql(
        """
        INSERT INTO customer_list_accesses
            (id, created_at, updated_at, customer_id, price_list_id)
        SELECT lower(hex(randomblob(16))), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
               access_customer_id, id
        FROM lists
        WHERE is_private = 1 AND access_customer_id IS NOT NULL
        """
    )


def rollback(migrator, database, fake=False, **kwargs):
    database.execute_sql("DROP TABLE customer_list_accesses")
    database.execute_sql("ALTER TABLE lists DROP COLUMN is_private")
