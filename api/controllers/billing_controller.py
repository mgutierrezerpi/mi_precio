from fastapi import APIRouter, Depends, Header, HTTPException, Request

from config import settings
from controllers.deps import require_owner
from controllers.input_types import CreateCheckout, ManualSubscriptionSync
from lib.ctx import activity, billing_context as billing
from views import TenantView

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/checkouts")
def create_checkout_endpoint(data: CreateCheckout, current_user: dict = Depends(require_owner)):
    if current_user.get("tenant_id") != data.tenant_id:
        raise HTTPException(status_code=403, detail="No tenés permisos para esta acción")
    try:
        url = billing.create_checkout(
            data.tenant_id,
            data.plan,
            email=current_user.get("email"),
            name=current_user.get("name"),
            redirect_url=data.redirect_url,
        )
    except billing.BillingError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"url": url}


@router.post("/manual-subscriptions")
def sync_manual_subscription_endpoint(
    data: ManualSubscriptionSync,
    x_billing_manual_secret: str | None = Header(default=None),
):
    if not settings.billing_manual_secret or x_billing_manual_secret != settings.billing_manual_secret:
        raise HTTPException(status_code=403, detail="Invalid billing secret")
    try:
        tenant = billing.sync_manual_subscription(
            tenant_id=data.tenant_id,
            plan=data.plan,
            status=data.status,
            subscription_id=data.subscription_id,
            customer_id=data.customer_id,
            variant_id=data.variant_id,
            renews_at=data.renews_at,
            ends_at=data.ends_at,
        )
    except billing.BillingError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    activity.record(data.tenant_id, "billing.manual_sync", f"Sincronizó plan {tenant.plan} ({data.status})")
    return TenantView.render(tenant)


@router.post("/lemon-squeezy/webhook")
async def lemonsqueezy_webhook_endpoint(request: Request):
    raw = await request.body()
    if not billing.verify_lemonsqueezy_signature(raw, request.headers.get("X-Signature")):
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    event_name = payload.get("meta", {}).get("event_name")
    data = payload.get("data", {})
    attrs = data.get("attributes", {})
    if data.get("id") and not attrs.get("id"):
        attrs["id"] = data["id"]

    if event_name and event_name.startswith("subscription_"):
        custom = payload.get("meta", {}).get("custom_data") or attrs.get("custom_data") or {}
        tenant = billing.sync_subscription_from_attributes(attrs, tenant_id=custom.get("tenant_id"))
        if tenant:
            activity.record(tenant.id, "billing.webhook", f"Lemon Squeezy: {event_name} ({tenant.billing_status})")

    return {"ok": True}
