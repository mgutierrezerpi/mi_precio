"""Request helpers used by public, unauthenticated endpoints."""

import ipaddress

from fastapi import Request


def request_ip(request: Request | None) -> str | None:
    """Resolve a client IP through the app's local reverse proxy."""
    if not request:
        return None
    client_host = request.client.host if request.client else None
    if client_host and client_host not in {"127.0.0.1", "::1"}:
        try:
            return str(ipaddress.ip_address(client_host))
        except ValueError:
            pass
    forwarded = request.headers.get("x-forwarded-for", "")
    for candidate in reversed(
        [part.strip() for part in forwarded.split(",") if part.strip()]
    ):
        try:
            return str(ipaddress.ip_address(candidate))
        except ValueError:
            continue
    try:
        return str(ipaddress.ip_address(client_host)) if client_host else None
    except ValueError:
        return None
