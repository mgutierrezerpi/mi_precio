"""Owner-initiated subscription action endpoints."""

from fastapi import APIRouter, Depends, HTTPException

from controllers.deps import require_owner
from controllers.input_types import ReconcileCheckout, SubscriptionAction
from lib.ctx import activity
from lib.ctx import billing_context as billing
from views import TenantView

router = APIRouter(prefix="/billing", tags=["billing"])


def _require_own_tenant(tenant_id: str, current_user: dict) -> None:
    if current_user.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=403, detail="No tenés permisos para esta acción")


def _subscription_action(
    data: SubscriptionAction, current_user: dict, action: str
):
    _require_own_tenant(data.tenant_id, current_user)
    operation = (
        billing.cancel_subscription if action == "cancelled" else billing.resume_subscription
    )
    try:
        tenant = operation(data.tenant_id)
    except billing.BillingError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    activity.record(
        tenant.id,
        f"billing.{action}",
        "Suscripción cancelada" if action == "cancelled" else "Suscripción reanudada",
        actor=current_user.get("email"),
        actor_id=current_user.get("sub"),
        entity_type="tenant",
        entity_id=tenant.id,
        meta={"plan": tenant.plan, "status": tenant.billing_status or ""},
    )
    return TenantView.render(tenant)


@router.post("/cancellations")
def cancel_subscription_endpoint(
    data: SubscriptionAction, current_user: dict = Depends(require_owner)
):
    return _subscription_action(data, current_user, "cancelled")


@router.post("/resumptions")
def resume_subscription_endpoint(
    data: SubscriptionAction, current_user: dict = Depends(require_owner)
):
    return _subscription_action(data, current_user, "resumed")


@router.post("/reconcile-checkout")
def reconcile_checkout_endpoint(
    data: ReconcileCheckout, current_user: dict = Depends(require_owner)
):
    _require_own_tenant(data.tenant_id, current_user)
    try:
        return billing.reconcile_checkout_order(data.tenant_id, data.order_id)
    except billing.BillingError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
