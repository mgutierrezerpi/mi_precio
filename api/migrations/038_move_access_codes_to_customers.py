"""Move protected-list credentials to the customer they belong to."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields("customers", access_code_hash=pw.CharField(max_length=255, null=True))

    # Preserve existing configured access where a list already named its CRM
    # customer. One customer code can then unlock every list assigned to it.
    database.execute_sql(
        """
        UPDATE customers
        SET access_code_hash = (
            SELECT access_code_hash
            FROM lists
            WHERE lists.access_customer_id = customers.id
              AND lists.access_code_hash IS NOT NULL
            ORDER BY lists.updated_at DESC
            LIMIT 1
        )
        WHERE access_code_hash IS NULL
          AND EXISTS (
            SELECT 1 FROM lists
            WHERE lists.access_customer_id = customers.id
              AND lists.access_code_hash IS NOT NULL
          )
        """
    )
def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields("customers", "access_code_hash")
