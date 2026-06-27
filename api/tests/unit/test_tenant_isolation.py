"""Tenant isolation: a token for one tenant can't touch another tenant's data.

Guards the middleware in app.py (enforce_tenant_isolation)."""

from lib import encode_token


def _auth(tenant_id: str, user_id: str = "u1", role: str = "owner") -> dict:
    token = encode_token(user_id, "user@shop.com", tenant_id, role)
    return {"Authorization": f"Bearer {token}"}


def test_cross_tenant_request_is_forbidden(client):
    # A token scoped to tenant "aaa" must not reach tenant "bbb"'s endpoints,
    # regardless of whether that tenant/data exists.
    res = client.get("/api/v1/tenants/bbb/customers", headers=_auth("aaa"))
    assert res.status_code == 403


def test_missing_token_is_unauthorized_not_forbidden(client):
    # No credentials -> the route's auth returns 401; isolation doesn't shadow it.
    res = client.get("/api/v1/tenants/bbb/customers")
    assert res.status_code == 401


def test_invalid_token_is_unauthorized(client):
    res = client.get(
        "/api/v1/tenants/bbb/customers",
        headers={"Authorization": "Bearer not-a-real-token"},
    )
    assert res.status_code == 401
