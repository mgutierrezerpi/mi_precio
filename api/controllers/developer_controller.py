from fastapi import APIRouter, Depends, HTTPException

from controllers.deps import require_super_admin
from controllers.input_types import UpdateFeatureFlag
from lib.ctx import feature_flags

router = APIRouter(prefix="/developer", tags=["developer"])


@router.get("/access")
def developer_access(current_user: dict = Depends(require_super_admin)):
    """Guard the developer portal with a server-side platform permission."""
    return {"enabled": True, "user_id": current_user.get("sub")}


@router.get("/feature-flags")
def list_feature_flags(current_user: dict = Depends(require_super_admin)):
    """List feature flags and their tenant rollout state for super admins."""
    return feature_flags.list_flags()


@router.put("/feature-flags/{key}/tenants/{tenant_id}")
def update_feature_flag(
    key: str,
    tenant_id: str,
    data: UpdateFeatureFlag,
    current_user: dict = Depends(require_super_admin),
):
    assignment = feature_flags.set_tenant_flag(key, tenant_id, data.enabled)
    if not assignment:
        raise HTTPException(status_code=404, detail="Feature flag or tenant not found")
    return assignment
