"""API routes registration."""

from fastapi import APIRouter, Depends

from controllers import CONTROLLER_ROUTERS
from controllers.deps import require_active_plan


def register_routes(app):
    """Register all routes with the FastAPI app."""

    @app.get("/health")
    def health():
        return {"status": "ok"}

    api = APIRouter(prefix="/api/v1")

    for router in CONTROLLER_ROUTERS:
        if router.plan_gated:
            api.include_router(router, dependencies=[Depends(require_active_plan)])
        else:
            api.include_router(router)

    app.include_router(api)
