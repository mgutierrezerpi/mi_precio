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
import json
import os
import re
import sqlite3
import sys
import unicodedata
from datetime import datetime
from pathlib import Path
from uuid import uuid4


HERE = Path(__file__).resolve().parent

# The existing seeder is the source of truth for the 28 template definitions.
# Its API credentials are only validated at import time, so provide harmless
# placeholders; this script never makes an HTTP request.
os.environ.setdefault("DEMO_TOKEN", "local-database-seed")
os.environ.setdefault("DEMO_TENANT_ID", "local-database-seed")
sys.path.insert(0, str(HERE))
from seed_pencil_price_lists import LISTS  # noqa: E402


SERVICE_DESIGNS = {
    "pencil-blush-bloom",
    "pencil-nova",
    "pencil-beardy",
    "pencil-calm-spa",
    "pencil-union-barber",
    "pencil-studio-mono",
    "pencil-beauty-issue",
}


def new_id() -> str:
    return uuid4().hex


def now() -> str:
    return datetime.utcnow().isoformat(sep=" ", timespec="seconds")


def slugify(value: str) -> str:
    normalized = (
        unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    )
    return re.sub(r"[^a-z0-9]+", "_", normalized.lower()).strip("_") or "lista"


def unique_slug(connection: sqlite3.Connection, tenant_id: str, name: str) -> str:
    base = slugify(name)
    candidate = base
    counter = 2
    while connection.execute(
        "SELECT 1 FROM lists WHERE tenant_id = ? AND slug = ? LIMIT 1",
        (tenant_id, candidate),
    ).fetchone():
        candidate = f"{base}_{counter}"
        counter += 1
    return candidate


def create_list(
    connection: sqlite3.Connection,
    tenant_id: str,
    definition: tuple,
    dry_run: bool,
) -> None:
    name, design, _published, _show_on_index, list_content, items = definition
    list_id = new_id()
    version_id = new_id()
    timestamp = now()
    kind = "service" if design in SERVICE_DESIGNS else "product"
    slug = unique_slug(connection, tenant_id, name)

    if dry_run:
        print(f"would create: {name} [{design}]")
        return

    connection.execute(
        """
        INSERT INTO lists (
            id, created_at, updated_at, tenant_id, name, slug, published,
            show_on_index, kind, design, capture_viewer_info
        ) VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?, 0)
        """,
        (list_id, timestamp, timestamp, tenant_id, name, slug, kind, design),
    )
    connection.execute(
        """
        INSERT INTO list_versions (
            id, created_at, updated_at, list_id, version_number, name,
            published, published_at, content, content_revision
        ) VALUES (?, ?, ?, ?, 1, 'v1', 1, ?, ?, 0)
        """,
        (
            version_id,
            timestamp,
            timestamp,
            list_id,
            timestamp,
            json.dumps(list_content, ensure_ascii=False),
        ),
    )
    for position, (item_name, item_price, description, category) in enumerate(items):
        connection.execute(
            """
            INSERT INTO items (
                id, created_at, updated_at, name, price, currency, description,
                position, category, list_version_id
            ) VALUES (?, ?, ?, ?, ?, 'UYU', ?, ?, ?, ?)
            """,
            (
                new_id(),
                timestamp,
                timestamp,
                item_name,
                item_price,
                description,
                position,
                category,
                version_id,
            ),
        )
    print(f"created: {name} [{design}]")


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
