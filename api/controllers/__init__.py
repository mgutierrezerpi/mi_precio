from controllers.auth_controller import router as auth_router
from controllers.billing_controller import router as billing_router
from controllers.billing_actions_controller import router as billing_actions_router
from controllers.categories_controller import router as categories_router
from controllers.customers_controller import router as customers_router
from controllers.designs_controller import router as designs_router
from controllers.developer_controller import router as developer_router
from controllers.import_controller import router as import_router
from controllers.items_controller import router as items_router
from controllers.leads_controller import router as leads_router
from controllers.link_trees_controller import router as link_trees_router
from controllers.lists_controller import router as lists_router
from controllers.magazines_controller import router as magazines_router
from controllers.notifications_controller import router as notifications_router
from controllers.products_controller import router as products_router
from controllers.public_controller import router as public_router
from controllers.public_viewers_controller import router as public_viewers_router
from controllers.support_controller import router as support_router
from controllers.team_controller import router as team_router
from controllers.tenant_insights_controller import router as tenant_insights_router
from controllers.tenants_controller import router as tenants_router
from controllers.versions_controller import router as versions_router

# Explicit re-exports
auth_router = auth_router
tenants_router = tenants_router
tenant_insights_router = tenant_insights_router
lists_router = lists_router
versions_router = versions_router
items_router = items_router
products_router = products_router
categories_router = categories_router
public_router = public_router
public_viewers_router = public_viewers_router
import_router = import_router
customers_router = customers_router
leads_router = leads_router
team_router = team_router
notifications_router = notifications_router
billing_router = billing_router
billing_actions_router = billing_actions_router
support_router = support_router
designs_router = designs_router
magazines_router = magazines_router
developer_router = developer_router
link_trees_router = link_trees_router
