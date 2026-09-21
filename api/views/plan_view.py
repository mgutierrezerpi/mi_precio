from datetime import datetime

from views.base_view import BaseView


class BillingSummaryView(BaseView):
    provider: str | None = None
    customer_id: str | None = None
    subscription_id: str | None = None
    variant_id: str | None = None
    status: str | None = None
    renews_at: datetime | None = None
    ends_at: datetime | None = None
    trial_ends_at: datetime | None = None
    portal_url: str | None = None
    update_payment_url: str | None = None
    card_brand: str | None = None
    card_last_four: str | None = None


class PlanView(BaseView):
    plan: str
    limits: dict[str, int | None]
    features: list[str]
    usage: dict[str, int]
    billing_enabled: bool
    plan_required: bool
    billing: BillingSummaryView | None = None

    @classmethod
    def render(cls, info: dict):
        return cls.model_validate(info)
