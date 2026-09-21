from views.activity_view import ActivityView as ActivityView
from views.analytics_view import ReportsView as ReportsView
from views.analytics_view import VisitStatsView as VisitStatsView
from views.auth_token_view import AuthTokenView as AuthTokenView
from views.billing_reconciliation_view import (
    BillingReconciliationView as BillingReconciliationView,
)
from views.category_view import CategoryView as CategoryView
from views.code_sent_view import CodeSentView as CodeSentView
from views.customer_detail_view import CustomerDetailView as CustomerDetailView
from views.customer_detail_view import CustomerStatsView as CustomerStatsView
from views.customer_view import CustomerView as CustomerView
from views.deleted_view import DeletedView as DeletedView
from views.developer_view import DeveloperAccessView as DeveloperAccessView
from views.developer_view import FeatureFlagAssignmentView as FeatureFlagAssignmentView
from views.developer_view import FeatureFlagView as FeatureFlagView
from views.invitation_view import InvitationView as InvitationView
from views.item_view import ItemView as ItemView
from views.lead_view import LeadView as LeadView
from views.link_tree_view import LinkTreeView as LinkTreeView
from views.list_design_view import ListDesignView as ListDesignView
from views.list_version_view import ListVersionView as ListVersionView
from views.magazine_page_view import MagazinePageView as MagazinePageView
from views.magazine_view import MagazineView as MagazineView
from views.notification_view import NotificationListView as NotificationListView
from views.notification_view import (
    NotificationPreferencesView as NotificationPreferencesView,
)
from views.notification_view import PushConfigView as PushConfigView
from views.operation_view import OkView as OkView
from views.operation_view import UrlView as UrlView
from views.order_item_view import OrderItemView as OrderItemView
from views.order_view import OrderView as OrderView
from views.plan_view import PlanView as PlanView
from views.price_list_view import PriceListView as PriceListView
from views.product_image_view import ProductImageView as ProductImageView
from views.product_view import ProductView as ProductView
from views.public_list_view import PublicListView as PublicListView
from views.public_magazine_view import PublicMagazineView as PublicMagazineView
from views.public_menu_view import PublicMenuView as PublicMenuView
from views.public_response_view import MarketplaceTenantView as MarketplaceTenantView
from views.public_response_view import PublicLinkTreeView as PublicLinkTreeView
from views.public_response_view import (
    PublicMagazineResponseView as PublicMagazineResponseView,
)
from views.public_response_view import PublicViewerStatsView as PublicViewerStatsView
from views.public_tenant_view import PublicTenantView as PublicTenantView
from views.public_viewer_view import PublicViewerView as PublicViewerView
from views.reordered_view import ReorderedView as ReorderedView
from views.support_ticket_view import SupportTicketView as SupportTicketView
from views.team_stats_view import TeamStatsView as TeamStatsView
from views.tenant_view import TenantView as TenantView
from views.user_view import UserView as UserView
