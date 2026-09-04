from models.base import db
from models.schema_columns import add_missing_columns, columns_for
from models.tenant_membership import TenantMembership
from models.tenant_schema import ensure_tenant_columns
from models.user import User


def ensure_columns() -> None:
    _ensure_list_columns()
    _ensure_list_version_columns()
    _ensure_product_columns()
    _ensure_optional_columns()
    _ensure_item_columns()
    ensure_tenant_columns()
    _ensure_link_tree_columns()
    _ensure_user_columns()
    _ensure_user_indexes()


def _ensure_list_columns() -> None:
    add_missing_columns("lists", [
        ("slug", "slug VARCHAR(255)"), ("kind", "kind VARCHAR(20) NOT NULL DEFAULT 'product'"),
        ("design", "design VARCHAR(32)"), ("hero_color", "hero_color VARCHAR(9)"),
        ("bg_url", "bg_url TEXT"), ("bg_overlay", "bg_overlay INTEGER"),
        ("parent_list_id", "parent_list_id VARCHAR(32)"), ("variant_type", "variant_type VARCHAR(20)"),
        ("customer_id", "customer_id VARCHAR(32)"), ("starts_at", "starts_at DATETIME"),
        ("ends_at", "ends_at DATETIME"),
        ("capture_viewer_info", "capture_viewer_info INTEGER NOT NULL DEFAULT 0"),
        ("is_private", "is_private INTEGER NOT NULL DEFAULT 0"),
    ])


def _ensure_list_version_columns() -> None:
    add_missing_columns("list_versions", [
        ("content", "content TEXT"),
        ("content_revision", "content_revision INTEGER NOT NULL DEFAULT 0"),
    ])


def _ensure_product_columns() -> None:
    columns = columns_for("products")
    if columns is None:
        return
    add_missing_columns("products", [
        ("available", "available INTEGER NOT NULL DEFAULT 1"),
        ("image_thumb_url", "image_thumb_url TEXT"),
    ])
    if "stock" in columns:
        db.execute_sql("ALTER TABLE products DROP COLUMN stock")


def _ensure_optional_columns() -> None:
    add_missing_columns("page_views", [
        ("source", "source VARCHAR(16) NOT NULL DEFAULT 'link'"),
        ("customer_id", "customer_id VARCHAR(32)"),
    ])
    add_missing_columns("activities", [("meta", "meta TEXT")])
    add_missing_columns("customers", [
        ("rut", "rut VARCHAR(32)"),
        ("access_code_hash", "access_code_hash VARCHAR(255)"),
    ])
    add_missing_columns("leads", [("customer_id", "customer_id VARCHAR(32)")])
    add_missing_columns("orders", [("reference", "reference VARCHAR(64)")])
    add_missing_columns("public_viewers", [
        ("customer_id", "customer_id VARCHAR(32)"),
        ("visitor_token", "visitor_token VARCHAR(64)"),
        ("ip_address", "ip_address VARCHAR(64)"),
    ])


def _ensure_item_columns() -> None:
    add_missing_columns("items", [
        ("product_id", "product_id VARCHAR(32)"),
        ("image_thumb_url", "image_thumb_url VARCHAR(500)"),
    ])


def _ensure_link_tree_columns() -> None:
    add_missing_columns("link_trees", [
        ("template", "template VARCHAR(32) NOT NULL DEFAULT 'botanical'")
    ])


def _ensure_user_columns() -> None:
    columns = columns_for("users")
    if columns is None:
        return
    add_missing_columns("users", [
        ("name", "name VARCHAR(255)"), ("role", "role VARCHAR(20) NOT NULL DEFAULT 'owner'"),
        ("is_super_admin", "is_super_admin INTEGER NOT NULL DEFAULT 0"),
        ("last_seen_at", "last_seen_at DATETIME"), ("notif_prefs", "notif_prefs TEXT"),
        ("notifications_seen_at", "notifications_seen_at DATETIME"),
    ])
    for column in ("simple_admin_ui", "admin_ui_mode"):
        if column in columns:
            db.execute_sql(f'ALTER TABLE users DROP COLUMN "{column}"')


def _ensure_user_indexes() -> None:
    if not db.table_exists("users"):
        return
    db.execute_sql(
        'CREATE INDEX IF NOT EXISTS "user_is_super_admin" ON "users" ("is_super_admin")'
    )
    db.execute_sql('REINDEX "user_is_super_admin"')


def ensure_memberships() -> None:
    """Backfill the legacy one-tenant user relationship into memberships."""
    for user in User.select():
        TenantMembership.get_or_create(
            user=user, tenant=user.tenant, defaults={"role": user.role or "owner"}
        )
