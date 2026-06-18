from datetime import datetime
from pydantic import BaseModel


class CreateCheckout(BaseModel):
    tenant_id: str
    plan: str


class ManualSubscriptionSync(BaseModel):
    tenant_id: str
    plan: str
    status: str = "active"
    subscription_id: str | None = None
    customer_id: str | None = None
    variant_id: str | None = None
    renews_at: datetime | None = None
    ends_at: datetime | None = None
