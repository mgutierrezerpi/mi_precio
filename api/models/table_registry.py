from peewee import DeferredForeignKey

from models.activity import Activity
from models.auth_code import AuthCode
from models.category import Category
from models.customer import Customer
from models.feature_flag import FeatureFlag, FeatureFlagAssignment
from models.invitation import Invitation
from models.item import Item
from models.lead import Lead
from models.link_tree import LinkTree
from models.list_version import ListVersion
from models.magazine import Magazine
from models.magazine_page import MagazinePage
from models.order import Order
from models.order_item import OrderItem
from models.page_view import PageView
from models.price_list import PriceList
from models.product import Product
from models.public_viewer import PublicViewer
from models.public_viewer_dismissal import PublicViewerDismissal
from models.push_subscription import PushSubscription
from models.tenant import Tenant
from models.tenant_membership import TenantMembership
from models.user import User

TABLES = [
    Tenant, User, AuthCode, PriceList, ListVersion, Magazine, MagazinePage, Item,
    Product, Category, PageView, Customer, PublicViewer, PublicViewerDismissal,
    Order, OrderItem, Activity, Invitation, PushSubscription, TenantMembership,
    LinkTree, FeatureFlag, FeatureFlagAssignment, Lead,
]


def resolve_deferred_foreign_keys() -> None:
    """Resolve Peewee 4 deferred fields before tables are created."""
    DeferredForeignKey.resolve(ListVersion)
