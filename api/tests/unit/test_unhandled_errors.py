"""An unhandled error must still reach the browser as a readable 500.

Starlette answers an uncaught exception from `ServerErrorMiddleware`, which
sits outside `CORSMiddleware`, so that 500 goes out without
`Access-Control-Allow-Origin`. The browser then drops the response and
`fetch` throws as if the network were down — the panel reported "No se pudo
conectar con el servidor" for what was a server bug (a corrupt SQLite index,
the day this was written).
"""

from fastapi import HTTPException
from fastapi.testclient import TestClient

from app import create_app
from config import settings

ORIGIN = settings.cors_origins[0]


def _app_with_failing_routes():
    app = create_app()

    @app.get("/api/v1/__boom")
    def boom():
        raise RuntimeError("database disk image is malformed")

    @app.get("/api/v1/__handled")
    def handled():
        raise HTTPException(404, "No está")

    return app


def test_unhandled_error_keeps_cors_headers():
    client = TestClient(_app_with_failing_routes(), raise_server_exceptions=False)

    response = client.get("/api/v1/__boom", headers={"Origin": ORIGIN})

    assert response.status_code == 500
    assert response.headers.get("access-control-allow-origin") == ORIGIN


def test_unhandled_error_answers_in_json_without_leaking_internals():
    client = TestClient(_app_with_failing_routes(), raise_server_exceptions=False)

    response = client.get("/api/v1/__boom", headers={"Origin": ORIGIN})

    detail = response.json()["detail"]
    # A sentence the panel can show as-is, not the exception text.
    assert isinstance(detail, str) and detail
    assert "malformed" not in detail
    assert "RuntimeError" not in detail


def test_handled_errors_are_left_alone():
    client = TestClient(_app_with_failing_routes(), raise_server_exceptions=False)

    response = client.get("/api/v1/__handled", headers={"Origin": ORIGIN})

    assert response.status_code == 404
    assert response.json() == {"detail": "No está"}
    assert response.headers.get("access-control-allow-origin") == ORIGIN
