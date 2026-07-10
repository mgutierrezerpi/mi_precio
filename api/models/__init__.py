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
from models.order import Order as Order
from models.order_item import OrderItem as OrderItem
from models.activity import Activity as Activity
from models.invitation import Invitation as Invitation
from models.push_subscription import PushSubscription as PushSubscription

# Resolve deferred foreign key
Item.list_version.set_model(ListVersion)


def create_tables():
    db.create_tables([Tenant, User, AuthCode, PriceList, ListVersion, Item, Product, Category, PageView, Customer, Order, OrderItem, Activity, Invitation, PushSubscription])
    ensure_columns()


def ensure_columns():
    list_columns = [column.name for column in db.get_columns("lists")]
    if "slug" not in list_columns:
        db.execute_sql("ALTER TABLE lists ADD COLUMN slug VARCHAR(255)")
    if "kind" not in list_columns:
        db.execute_sql("ALTER TABLE lists ADD COLUMN kind VARCHAR(20) NOT NULL DEFAULT 'product'")

    product_columns = [column.name for column in db.get_columns("products")]
    if "available" not in product_columns:
        db.execute_sql("ALTER TABLE products ADD COLUMN available INTEGER NOT NULL DEFAULT 1")
    if "image_thumb_url" not in product_columns:
        db.execute_sql("ALTER TABLE products ADD COLUMN image_thumb_url TEXT")
    if "stock" in product_columns:
        # Stock-by-quantity was replaced by the `available` boolean.
        db.execute_sql("ALTER TABLE products DROP COLUMN stock")

    page_view_columns = [column.name for column in db.get_columns("page_views")]
    if "source" not in page_view_columns:
        db.execute_sql("ALTER TABLE page_views ADD COLUMN source VARCHAR(16) NOT NULL DEFAULT 'link'")

    activity_columns = [column.name for column in db.get_columns("activities")]
    if "meta" not in activity_columns:
        db.execute_sql("ALTER TABLE activities ADD COLUMN meta TEXT")

    item_columns = [column.name for column in db.get_columns("items")]
    if "product_id" not in item_columns:
        db.execute_sql("ALTER TABLE items ADD COLUMN product_id VARCHAR(32)")
    if "image_thumb_url" not in item_columns:
        db.execute_sql("ALTER TABLE items ADD COLUMN image_thumb_url VARCHAR(500)")

    if db.table_exists("customers"):
        customer_columns = [column.name for column in db.get_columns("customers")]
        if "rut" not in customer_columns:
            db.execute_sql("ALTER TABLE customers ADD COLUMN rut VARCHAR(32)")

    if db.table_exists("orders"):
        order_columns = [column.name for column in db.get_columns("orders")]
        if "reference" not in order_columns:
            db.execute_sql("ALTER TABLE orders ADD COLUMN reference VARCHAR(64)")

    tenant_columns = [column.name for column in db.get_columns("tenants")]
    for col, ddl in [
        ("plan", "plan VARCHAR(16) NOT NULL DEFAULT 'free'"),
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
        ("logo_url", "logo_url TEXT"),
        ("brand_color", "brand_color VARCHAR(9)"),
        ("description", "description TEXT"),
        ("language", "language VARCHAR(5) NOT NULL DEFAULT 'es'"),
        ("timezone", "timezone VARCHAR(64) NOT NULL DEFAULT 'America/Montevideo'"),
        ("delivery_enabled", "delivery_enabled INTEGER NOT NULL DEFAULT 0"),
        ("legal_name", "legal_name VARCHAR(255)"),
        ("tax_id", "tax_id VARCHAR(32)"),
        ("address", "address TEXT"),
    ]:
        if col not in tenant_columns:
            db.execute_sql(f"ALTER TABLE tenants ADD COLUMN {ddl}")

    user_columns = [column.name for column in db.get_columns("users")]
    if "name" not in user_columns:
        db.execute_sql("ALTER TABLE users ADD COLUMN name VARCHAR(255)")
    if "role" not in user_columns:
        # Existing single-user tenants are their own owners.
        db.execute_sql("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'owner'")
    if "last_seen_at" not in user_columns:
        db.execute_sql("ALTER TABLE users ADD COLUMN last_seen_at DATETIME")
    if "notif_prefs" not in user_columns:
        db.execute_sql("ALTER TABLE users ADD COLUMN notif_prefs TEXT")
    if "notifications_seen_at" not in user_columns:
        db.execute_sql("ALTER TABLE users ADD COLUMN notifications_seen_at DATETIME")
    if "simple_admin_ui" not in user_columns:
        db.execute_sql("ALTER TABLE users ADD COLUMN simple_admin_ui INTEGER NOT NULL DEFAULT 0")
    if "admin_ui_mode" not in user_columns:
        db.execute_sql(
            "ALTER TABLE users ADD COLUMN admin_ui_mode VARCHAR(16) NOT NULL DEFAULT 'full'"
        )
        db.execute_sql("UPDATE users SET admin_ui_mode = 'simple' WHERE simple_admin_ui = 1")
