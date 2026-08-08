from models.base import db as db, BaseModel as BaseModel
from models.tenant import Tenant as Tenant
from models.user import User as User
from models.auth_code import AuthCode as AuthCode
from models.price_list import PriceList as PriceList
from models.list_version import ListVersion as ListVersion
from models.item import Item as Item
from models.product import Product as Product
from models.category import Category as Category
from models.page_view import PageView as PageView
from models.customer import Customer as Customer
from models.public_viewer import PublicViewer as PublicViewer
from models.public_viewer_dismissal import PublicViewerDismissal as PublicViewerDismissal
from models.order import Order as Order
from models.order_item import OrderItem as OrderItem
from models.activity import Activity as Activity
from models.invitation import Invitation as Invitation
from models.push_subscription import PushSubscription as PushSubscription
from models.tenant_membership import TenantMembership as TenantMembership

# Resolve deferred foreign key
Item.list_version.set_model(ListVersion)


def create_tables():
    db.create_tables(
        [
            Tenant,
            User,
            AuthCode,
            PriceList,
            ListVersion,
            Item,
            Product,
            Category,
            PageView,
            Customer,
            PublicViewer,
            PublicViewerDismissal,
            Order,
            OrderItem,
            Activity,
            Invitation,
            PushSubscription,
            TenantMembership,
        ]
    )
    ensure_columns()
    ensure_memberships()


def ensure_columns():
    _ensure_list_columns()
    _ensure_product_columns()
    _ensure_optional_columns()
    _ensure_item_columns()
    _ensure_tenant_columns()
    _ensure_user_columns()


def _ensure_list_columns():
    _add_missing_columns(
        "lists",
        [
            ("slug", "slug VARCHAR(255)"),
            ("kind", "kind VARCHAR(20) NOT NULL DEFAULT 'product'"),
            ("design", "design VARCHAR(32)"),
            ("hero_color", "hero_color VARCHAR(9)"),
            ("bg_url", "bg_url TEXT"),
            ("bg_overlay", "bg_overlay INTEGER"),
            ("parent_list_id", "parent_list_id VARCHAR(32)"),
            ("variant_type", "variant_type VARCHAR(20)"),
            ("customer_id", "customer_id VARCHAR(32)"),
            ("starts_at", "starts_at DATETIME"),
            ("ends_at", "ends_at DATETIME"),
            ("capture_viewer_info", "capture_viewer_info INTEGER NOT NULL DEFAULT 0"),
        ],
    )


def _ensure_product_columns():
    columns = _columns("products")
    if columns is None:
        return
    _add_missing_columns(
        "products",
        [
            ("available", "available INTEGER NOT NULL DEFAULT 1"),
            ("image_thumb_url", "image_thumb_url TEXT"),
        ],
    )
    if "stock" in columns:
        db.execute_sql("ALTER TABLE products DROP COLUMN stock")


def _ensure_optional_columns():
    _add_missing_columns(
        "page_views", [("source", "source VARCHAR(16) NOT NULL DEFAULT 'link'")]
    )
    _add_missing_columns("activities", [("meta", "meta TEXT")])
    _add_missing_columns("customers", [("rut", "rut VARCHAR(32)")])
    _add_missing_columns("orders", [("reference", "reference VARCHAR(64)")])
    _add_missing_columns(
        "public_viewers",
        [
            ("customer_id", "customer_id VARCHAR(32)"),
            ("visitor_token", "visitor_token VARCHAR(64)"),
            ("ip_address", "ip_address VARCHAR(64)"),
        ],
    )


def _ensure_item_columns():
    _add_missing_columns(
        "items",
        [
            ("product_id", "product_id VARCHAR(32)"),
            ("image_thumb_url", "image_thumb_url VARCHAR(500)"),
        ],
    )


def _ensure_tenant_columns():
    _add_missing_columns(
        "tenants",
        [
            ("plan", "plan VARCHAR(16) NOT NULL DEFAULT 'free'"),
            ("plan_gate", "plan_gate INTEGER NOT NULL DEFAULT 0"),
            ("billing_provider", "billing_provider VARCHAR(32)"),
            ("billing_customer_id", "billing_customer_id VARCHAR(64)"),
            ("billing_subscription_id", "billing_subscription_id VARCHAR(64)"),
            ("billing_variant_id", "billing_variant_id VARCHAR(64)"),
            ("billing_status", "billing_status VARCHAR(32)"),
            ("billing_renews_at", "billing_renews_at DATETIME"),
            ("billing_ends_at", "billing_ends_at DATETIME"),
            ("billing_trial_ends_at", "billing_trial_ends_at DATETIME"),
            ("billing_portal_url", "billing_portal_url TEXT"),
            ("billing_update_payment_url", "billing_update_payment_url TEXT"),
            ("billing_card_brand", "billing_card_brand VARCHAR(32)"),
            ("billing_card_last_four", "billing_card_last_four VARCHAR(8)"),
            ("billing_checkout_id", "billing_checkout_id VARCHAR(64)"),
            ("billing_order_id", "billing_order_id VARCHAR(64)"),
            ("billing_sync_started_at", "billing_sync_started_at DATETIME"),
            ("billing_sync_next_at", "billing_sync_next_at DATETIME"),
            (
                "billing_sync_attempts",
                "billing_sync_attempts INTEGER NOT NULL DEFAULT 0",
            ),
            ("logo_url", "logo_url TEXT"),
            ("brand_color", "brand_color VARCHAR(9)"),
            ("description", "description TEXT"),
            ("list_design", "list_design VARCHAR(32)"),
            ("list_bg_url", "list_bg_url TEXT"),
            ("list_bg_overlay", "list_bg_overlay INTEGER NOT NULL DEFAULT 0"),
            ("list_hero_color", "list_hero_color VARCHAR(9)"),
            ("language", "language VARCHAR(5) NOT NULL DEFAULT 'es'"),
            ("timezone", "timezone VARCHAR(64) NOT NULL DEFAULT 'America/Montevideo'"),
            ("delivery_enabled", "delivery_enabled INTEGER NOT NULL DEFAULT 0"),
            ("marketplace_enabled", "marketplace_enabled INTEGER NOT NULL DEFAULT 1"),
            ("marketplace_latitude", "marketplace_latitude VARCHAR(32)"),
            ("marketplace_longitude", "marketplace_longitude VARCHAR(32)"),
            ("business_category", "business_category VARCHAR(32)"),
            ("whatsapp_url", "whatsapp_url TEXT"),
            ("website_url", "website_url TEXT"),
            ("instagram_url", "instagram_url TEXT"),
            ("legal_name", "legal_name VARCHAR(255)"),
            ("tax_id", "tax_id VARCHAR(32)"),
            ("address", "address TEXT"),
        ],
    )


def _ensure_user_columns():
    columns = _columns("users")
    if columns is None:
        return
    _add_missing_columns(
        "users",
        [
            ("name", "name VARCHAR(255)"),
            ("role", "role VARCHAR(20) NOT NULL DEFAULT 'owner'"),
            ("last_seen_at", "last_seen_at DATETIME"),
            ("notif_prefs", "notif_prefs TEXT"),
            ("notifications_seen_at", "notifications_seen_at DATETIME"),
        ],
    )
    for column in ("simple_admin_ui", "admin_ui_mode"):
        if column in columns:
            db.execute_sql(f'ALTER TABLE users DROP COLUMN "{column}"')


def _add_missing_columns(table_name: str, columns_to_add: list[tuple[str, str]]):
    columns = _columns(table_name)
    if columns is None:
        return
    for name, ddl in columns_to_add:
        if name not in columns:
            db.execute_sql(f"ALTER TABLE {table_name} ADD COLUMN {ddl}")


def ensure_memberships():
    """Backfill the legacy one-tenant user relationship into memberships."""
    for user in User.select():
        TenantMembership.get_or_create(
            user=user, tenant=user.tenant, defaults={"role": user.role or "owner"}
        )


def _columns(table_name: str) -> list[str] | None:
    if not db.table_exists(table_name):
        return None
    return [column.name for column in db.get_columns(table_name)]
