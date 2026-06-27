"""Mi Precio API - FastAPI Application."""

import logging
import re
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from config import settings
from lib import decode_token
from models import db, create_tables
from routes import register_routes

# Every authenticated `/tenants/{id}/...` request must target the caller's own
# tenant. Users belong to exactly one tenant, so the id in the path has to match
# the `tenant_id` baked into their token — otherwise it's a cross-tenant access.
_TENANT_SCOPED_PATH = re.compile(r"^/api/v1/tenants/([^/]+)")


async def enforce_tenant_isolation(request: Request, call_next):
    match = _TENANT_SCOPED_PATH.match(request.url.path)
    if match:
        auth = request.headers.get("authorization", "")
        if auth[:7].lower() == "bearer ":
            payload = decode_token(auth[7:])
            token_tenant = payload.get("tenant_id") if payload else None
            # Only block authenticated callers with a valid token for a different
            # tenant; missing/invalid tokens fall through to the route's own 401.
            if token_tenant and match.group(1) != token_tenant:
                return JSONResponse(
                    status_code=403, content={"detail": "No tenés acceso a este negocio"}
                )
    return await call_next(request)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.connect(reuse_if_open=True)
    create_tables()
    yield
    if not db.is_closed():
        db.close()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="API for managing price lists",
        version="1.0.0",
        debug=settings.debug,
        lifespan=lifespan,
    )

    # Added before CORS so CORS stays the outermost layer and still attaches its
    # headers to a 403 returned by the isolation check.
    app.add_middleware(BaseHTTPMiddleware, dispatch=enforce_tenant_isolation)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_routes(app)
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=settings.debug)
