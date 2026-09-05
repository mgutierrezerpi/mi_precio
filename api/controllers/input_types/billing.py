from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class CreateCheckout(BaseModel):
    tenant_id: str
    plan: str
    redirect_url: str | None = None
    locale: Literal["es", "en"] = "es"


class SubscriptionAction(BaseModel):
    """Cancel / resume the tenant's own subscription."""

    tenant_id: str


class ManualSubscriptionSync(BaseModel):
    tenant_id: str
    plan: str
    status: str = "active"
    subscription_id: str | None = None
    customer_id: str | None = None
    variant_id: str | None = None
    renews_at: datetime | None = None
    ends_at: datetime | None = None


class ReconcileCheckout(BaseModel):
    tenant_id: str
    order_id: str
