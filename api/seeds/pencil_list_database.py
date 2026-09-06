"""SQLite helpers for creating Pencil demo price lists."""

from __future__ import annotations

import json
import re
import sqlite3
import unicodedata
from datetime import datetime
from uuid import uuid4


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
        (version_id, timestamp, timestamp, list_id, timestamp, json.dumps(list_content, ensure_ascii=False)),
    )
    for position, (item_name, item_price, description, category) in enumerate(items):
        connection.execute(
            """
            INSERT INTO items (
                id, created_at, updated_at, name, price, currency, description,
                position, category, list_version_id
            ) VALUES (?, ?, ?, ?, ?, 'UYU', ?, ?, ?, ?)
            """,
            (new_id(), timestamp, timestamp, item_name, item_price, description, position, category, version_id),
        )
    print(f"created: {name} [{design}]")
