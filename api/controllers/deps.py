"""Controller dependencies."""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from lib import decode_token
from lib.ctx import plans_context
from models import User

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
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
            raise HTTPException(
                status_code=403, detail="No tenés permisos para esta acción"
            )
        return current_user

    return dependency


def require_active_plan(current_user: dict = Depends(get_current_user)) -> dict:
    """Block CRM data endpoints while the tenant still has to pick a plan.

    The frontend routes gated tenants to the plan screen, but the session lives
    in localStorage, so the block has to be enforced here too. Endpoints needed
    to *get out* of the gate stay open: auth, /users/me, reading the tenant,
    plan info, changing the plan, checkout, and deleting the account."""

    tenant_id = current_user.get("tenant_id")
    if tenant_id and plans_context.plan_required(tenant_id):
        raise HTTPException(
            status_code=402,
            detail={
                "code": "plan_required",
                "message": plans_context.PLAN_REQUIRED_MESSAGE,
            },
        )
    return current_user


# Catalog/CRM writes: owners, admins and editors. Viewers are read-only.
require_editor = require_roles("owner", "admin", "editor")
# Team management and tenant settings: owners and admins only.
require_admin = require_roles("owner", "admin")
# Destructive account-level actions (e.g. deleting the account): owner only.
require_owner = require_roles("owner")


def require_super_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Allow only platform super admins, independent of tenant role."""
    user = User.get_or_none(User.id == current_user.get("sub"))
    if not user or not bool(getattr(user, "is_super_admin", False)):
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user
