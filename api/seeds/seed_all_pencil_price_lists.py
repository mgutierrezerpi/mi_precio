"""Seed every Pencil price-list design for every local tenant.

This is intentionally a database-local seeder. It bypasses the authenticated
HTTP API because one token can only see one user's tenants. Run it against the
local API database (normally from inside the API container) instead.

The seed is additive and idempotent: an existing root list with the same
Pencil design is left untouched, while missing designs receive a published
sample list with one version and the reusable demo catalog items.
"""

from __future__ import annotations

import argparse
import os
import sqlite3
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent

# The existing seeder is the source of truth for the 28 template definitions.
# Its API credentials are only validated at import time, so provide harmless
# placeholders; this script never makes an HTTP request.
os.environ.setdefault("DEMO_TOKEN", "local-database-seed")
os.environ.setdefault("DEMO_TENANT_ID", "local-database-seed")
sys.path.insert(0, str(HERE))
from seed_pencil_price_lists import LISTS  # noqa: E402
from pencil_list_database import create_list


def seed(database_path: Path, dry_run: bool) -> tuple[int, int]:
    if not database_path.exists():
        raise FileNotFoundError(
            f"Database not found at {database_path}. Set DATABASE_PATH or run inside the API container."
        )

    connection = sqlite3.connect(database_path)
    connection.execute("PRAGMA foreign_keys = ON")
    tenants = connection.execute(
        """
        WITH tenant_users AS (
            SELECT id AS user_id, tenant_id FROM users
            UNION
            SELECT user_id, tenant_id FROM tenant_memberships
        )
        SELECT tenants.id, tenants.name, tenants.subdomain,
               COUNT(DISTINCT tenant_users.user_id)
        FROM tenants
        JOIN tenant_users ON tenant_users.tenant_id = tenants.id
        GROUP BY tenants.id, tenants.name, tenants.subdomain
        ORDER BY tenants.created_at, tenants.id
        """
    ).fetchall()
    created = 0
    skipped = 0
    try:
        for tenant_id, tenant_name, subdomain, user_count in tenants:
            existing = {
                row[0]
                for row in connection.execute(
                    "SELECT design FROM lists WHERE tenant_id = ? AND parent_list_id IS NULL",
                    (tenant_id,),
                ).fetchall()
                if row[0]
            }
            print(
                f"tenant: {tenant_name} ({subdomain}) · {user_count} user(s)"
            )
            for definition in LISTS:
                design = definition[1]
                if design in existing:
                    skipped += 1
                    continue
                create_list(connection, tenant_id, definition, dry_run)
                created += 1
        if dry_run:
            connection.rollback()
        else:
            connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
    return created, skipped


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create missing Pencil price-list designs for every local tenant."
    )
    parser.add_argument(
        "--database",
        type=Path,
        default=Path(os.environ.get("DATABASE_PATH", "/data/mi_precio.db")),
        help="SQLite database path (default: DATABASE_PATH or /data/mi_precio.db)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report missing lists without writing to the database.",
    )
    args = parser.parse_args()
    created, skipped = seed(args.database, args.dry_run)
    action = "would create" if args.dry_run else "created"
    print(f"done: {action} {created} list(s); skipped {skipped} existing design(s)")


if __name__ == "__main__":
    main()
