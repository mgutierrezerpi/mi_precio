"""API routes registration."""

from fastapi import APIRouter, Depends

from controllers import (
    auth_router,
    billing_router,
    billing_actions_router,
    categories_router,
    customers_router,
    designs_router,
    developer_router,
    import_router,
    items_router,
    leads_router,
    link_trees_router,
    lists_router,
    magazines_router,
    notifications_router,
    products_router,
    public_router,
    public_viewers_router,
    support_router,
    team_router,
    tenant_insights_router,
    tenants_router,
    versions_router,
)
from controllers.deps import require_active_plan


def register_routes(app):
    """Register all routes with the FastAPI app."""

    @app.get("/health")
    def health():
        return {"status": "ok"}

    api = APIRouter(prefix="/api/v1")

    # Routers whose every endpoint is CRM data: closed while the tenant still
    # owes us a plan (see controllers.deps.require_active_plan). `auth`,
    # `public` and `billing` stay open by design; `tenants` and `team` mix
    # gated and ungated endpoints, so they carry the dependency per route.
    plan_gated = [Depends(require_active_plan)]

    api.include_router(auth_router)
    api.include_router(tenants_router)
    api.include_router(tenant_insights_router)
    api.include_router(lists_router, dependencies=plan_gated)
    api.include_router(versions_router, dependencies=plan_gated)
    api.include_router(items_router, dependencies=plan_gated)
    api.include_router(products_router, dependencies=plan_gated)
    api.include_router(categories_router, dependencies=plan_gated)
    api.include_router(public_router)
    api.include_router(import_router, dependencies=plan_gated)
    api.include_router(customers_router, dependencies=plan_gated)
    api.include_router(public_viewers_router, dependencies=plan_gated)
    api.include_router(leads_router, dependencies=plan_gated)
    api.include_router(team_router)
    api.include_router(notifications_router, dependencies=plan_gated)
    api.include_router(billing_router)
    api.include_router(billing_actions_router)
    api.include_router(support_router, dependencies=plan_gated)
    api.include_router(designs_router, dependencies=plan_gated)
    api.include_router(magazines_router, dependencies=plan_gated)
    api.include_router(developer_router)
    api.include_router(link_trees_router)

    app.include_router(api)
