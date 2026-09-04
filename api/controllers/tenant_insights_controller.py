"""Plan-gated tenant reporting and activity endpoints."""

from fastapi import APIRouter, Depends, Query

from controllers.deps import get_current_user, require_active_plan
from lib.ctx import activity, analytics
from views import ActivityView

router = APIRouter(
    prefix="/tenants",
    tags=["tenants"],
    dependencies=[Depends(require_active_plan)],
)


@router.get("/{tenant_id}/stats/visits")
def visit_stats_endpoint(
    tenant_id: str, current_user: dict = Depends(get_current_user)
):
    return analytics.visit_stats(tenant_id)


@router.get("/{tenant_id}/stats/reports")
def reports_endpoint(
    tenant_id: str,
    days: int = 30,
    list_id: str | None = None,
    customer_id: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    return analytics.reports(tenant_id, days, list_id, customer_id)


@router.get("/{tenant_id}/activity")
def list_activity_endpoint(
    tenant_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    return ActivityView.render_many(
        activity.list_activity(tenant_id, limit=limit, offset=offset)
    )
