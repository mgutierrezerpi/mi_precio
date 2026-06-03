"""API routes registration."""

from fastapi import APIRouter
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
)


def register_routes(app):
    """Register all routes with the FastAPI app."""

    @app.get("/health")
    def health():
        return {"status": "ok"}

    api = APIRouter(prefix="/api/v1")
    api.include_router(auth_router)
    api.include_router(tenants_router)
    api.include_router(lists_router)
    api.include_router(versions_router)
    api.include_router(items_router)
    api.include_router(products_router)
    api.include_router(categories_router)
    api.include_router(public_router)
    api.include_router(import_router)

    app.include_router(api)
