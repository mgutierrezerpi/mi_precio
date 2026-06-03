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

# Resolve deferred foreign key
Item.list_version.set_model(ListVersion)


def create_tables():
    db.create_tables([Tenant, User, AuthCode, PriceList, ListVersion, Item, Product, Category, PageView])
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
