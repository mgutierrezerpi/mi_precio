from models.activity import Activity as Activity
from models.auth_code import AuthCode as AuthCode
from models.base import BaseModel as BaseModel
from models.base import db as db
from models.category import Category as Category
from models.customer import Customer as Customer
from models.customer_list_access import CustomerListAccess as CustomerListAccess
from models.feature_flag import FeatureFlag as FeatureFlag
from models.feature_flag import FeatureFlagAssignment as FeatureFlagAssignment
from models.invitation import Invitation as Invitation
from models.item import Item as Item
from models.lead import Lead as Lead
from models.link_tree import LinkTree as LinkTree
from models.list_version import ListVersion as ListVersion
from models.magazine import Magazine as Magazine
from models.magazine_page import MagazinePage as MagazinePage
from models.order import Order as Order
from models.order_item import OrderItem as OrderItem
from models.page_view import PageView as PageView
from models.price_list import PriceList as PriceList
from models.product import Product as Product
from models.public_viewer import PublicViewer as PublicViewer
from models.public_viewer_dismissal import (
    PublicViewerDismissal as PublicViewerDismissal,
)
from models.push_subscription import PushSubscription as PushSubscription
from models.schema_maintenance import ensure_columns as ensure_columns
from models.schema_maintenance import ensure_memberships as ensure_memberships
from models.table_registry import TABLES, resolve_deferred_foreign_keys
from models.tenant import Tenant as Tenant
from models.tenant_membership import TenantMembership as TenantMembership
from models.user import User as User


def create_tables() -> None:
    resolve_deferred_foreign_keys()
    db.create_tables(TABLES)
    ensure_columns()
    ensure_memberships()
