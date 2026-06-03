from controllers.auth_controller import router as auth_router
from controllers.tenants_controller import router as tenants_router
from controllers.lists_controller import router as lists_router
from controllers.versions_controller import router as versions_router
from controllers.items_controller import router as items_router
from controllers.products_controller import router as products_router
from controllers.categories_controller import router as categories_router
from controllers.public_controller import router as public_router
from controllers.import_controller import router as import_router
from controllers.customers_controller import router as customers_router
from controllers.team_controller import router as team_router
from controllers.notifications_controller import router as notifications_router

# Explicit re-exports
auth_router = auth_router
tenants_router = tenants_router
lists_router = lists_router
versions_router = versions_router
items_router = items_router
products_router = products_router
categories_router = categories_router
public_router = public_router
import_router = import_router
customers_router = customers_router
team_router = team_router
notifications_router = notifications_router
