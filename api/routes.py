"""API routes registration."""

from fastapi import APIRouter, Depends
from controllers.deps import require_active_plan
from controllers import (
    auth_router,
    tenants_router,
    lists_router,
    versions_router,
    items_router,
    products_router,
    categories_router,
    public_router,
    import_router,
    customers_router,
    leads_router,
    team_router,
    notifications_router,
    billing_router,
    support_router,
)


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
    api.include_router(lists_router, dependencies=plan_gated)
    api.include_router(versions_router, dependencies=plan_gated)
    api.include_router(items_router, dependencies=plan_gated)
    api.include_router(products_router, dependencies=plan_gated)
    api.include_router(categories_router, dependencies=plan_gated)
    api.include_router(public_router)
    api.include_router(import_router, dependencies=plan_gated)
    api.include_router(customers_router, dependencies=plan_gated)
    api.include_router(leads_router, dependencies=plan_gated)
    api.include_router(team_router)
    api.include_router(notifications_router, dependencies=plan_gated)
    api.include_router(billing_router)
    api.include_router(support_router, dependencies=plan_gated)

    app.include_router(api)
