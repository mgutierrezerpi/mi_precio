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

# Resolve deferred foreign key
Item.list_version.set_model(ListVersion)


def create_tables():
    db.create_tables([Tenant, User, AuthCode, PriceList, ListVersion, Item, Product, Category, PageView, Customer, Order, OrderItem, Activity])
    ensure_columns()


def ensure_columns():
    list_columns = [column.name for column in db.get_columns("lists")]
    if "slug" not in list_columns:
        db.execute_sql("ALTER TABLE lists ADD COLUMN slug VARCHAR(255)")

    product_columns = [column.name for column in db.get_columns("products")]
    if "available" not in product_columns:
        db.execute_sql("ALTER TABLE products ADD COLUMN available INTEGER NOT NULL DEFAULT 1")
    if "stock" in product_columns:
        # Stock-by-quantity was replaced by the `available` boolean.
        db.execute_sql("ALTER TABLE products DROP COLUMN stock")

    page_view_columns = [column.name for column in db.get_columns("page_views")]
    if "source" not in page_view_columns:
        db.execute_sql("ALTER TABLE page_views ADD COLUMN source VARCHAR(16) NOT NULL DEFAULT 'link'")

    if db.table_exists("customers"):
        customer_columns = [column.name for column in db.get_columns("customers")]
        if "rut" not in customer_columns:
            db.execute_sql("ALTER TABLE customers ADD COLUMN rut VARCHAR(32)")

    if db.table_exists("orders"):
        order_columns = [column.name for column in db.get_columns("orders")]
        if "reference" not in order_columns:
            db.execute_sql("ALTER TABLE orders ADD COLUMN reference VARCHAR(64)")
