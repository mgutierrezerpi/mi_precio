"""Controller dependencies."""

from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from lib import decode_token

security = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Tokens issued before roles existed belong to single-user tenant owners.
    payload.setdefault("role", "owner")
    return payload


def require_roles(*allowed: str):
    """Dependency factory: allow the request only if the caller's role is in `allowed`.

    Returns the same payload as `get_current_user`, so handlers keep reading
    `current_user["email"]` / `["sub"]` unchanged."""

    def dependency(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user.get("role", "owner") not in allowed:
            raise HTTPException(status_code=403, detail="No tenés permisos para esta acción")
        return current_user

    return dependency


# Catalog/CRM writes: owners, admins and editors. Viewers are read-only.
require_editor = require_roles("owner", "admin", "editor")
# Team management and tenant settings: owners and admins only.
require_admin = require_roles("owner", "admin")
# Destructive account-level actions (e.g. deleting the account): owner only.
require_owner = require_roles("owner")
