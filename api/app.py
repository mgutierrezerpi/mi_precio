"""Mi Precio API - FastAPI Application."""

import logging
import re
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from config import settings
from infra.sentry import init_sentry
from lib import decode_token
from models import create_tables, db
from routes import register_routes

# Every authenticated `/tenants/{id}/...` request must target the caller's own
# tenant. Users belong to exactly one tenant, so the id in the path has to match
# the `tenant_id` baked into their token — otherwise it's a cross-tenant access.
_TENANT_SCOPED_PATH = re.compile(r"^/api/v1/tenants/([^/]+)")
_TENANT_SWITCH_PATH = re.compile(r"^/api/v1/tenants/[^/]+/switch$")


async def enforce_tenant_isolation(request: Request, call_next):
    match = _TENANT_SCOPED_PATH.match(request.url.path)
    if match and not _TENANT_SWITCH_PATH.match(request.url.path):
        auth = request.headers.get("authorization", "")
        if auth[:7].lower() == "bearer ":
            payload = decode_token(auth[7:])
            token_tenant = payload.get("tenant_id") if payload else None
            # Only block authenticated callers with a valid token for a different
            # tenant; missing/invalid tokens fall through to the route's own 401.
            if token_tenant and match.group(1) != token_tenant:
                return JSONResponse(
                    status_code=403,
                    content={"detail": "No tenés acceso a este negocio"},
                )
    return await call_next(request)


_log = logging.getLogger(__name__)


async def unhandled_errors_as_json(request: Request, call_next):
    """Answer an uncaught exception with a JSON 500 from inside the CORS layer.

    Left to Starlette, an uncaught exception is answered by
    `ServerErrorMiddleware`, which sits outside `CORSMiddleware`. That 500 goes
    out without `Access-Control-Allow-Origin`, the browser drops it, and
    `fetch` throws exactly as it would with the API down — so the panel told
    shops "No se pudo conectar con el servidor" about what was a server bug.
    Catching it here keeps CORS on the response and gives the panel a sentence
    it can show. An `exception_handler(Exception)` would not do: Starlette
    hangs that one on `ServerErrorMiddleware` too, still outside CORS.
    """
    try:
        return await call_next(request)
    except Exception:
        _log.exception("Unhandled error on %s %s", request.method, request.url.path)
        # Swallowing the exception hides it from Sentry's own hooks, which
        # live on the middleware we are now bypassing. No-op without a DSN.
        sentry_sdk.capture_exception()
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Algo falló de nuestro lado. Probá de nuevo en un momento."
            },
        )


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
init_sentry()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.connect(reuse_if_open=True)
    create_tables()
    from lib.ctx import products

    products.backfill_orphan_items()
    yield
    if not db.is_closed():
        db.close()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="API for managing price lists and magazines",
        version="1.0.0",
        debug=settings.debug,
        lifespan=lifespan,
    )

    # Both added before CORS so CORS stays the outermost layer and still
    # attaches its headers to a 403 from the isolation check and to a 500 from
    # an unhandled error. The error catcher wraps the isolation check too.
    app.add_middleware(BaseHTTPMiddleware, dispatch=enforce_tenant_isolation)
    app.add_middleware(BaseHTTPMiddleware, dispatch=unhandled_errors_as_json)

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
