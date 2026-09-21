from views.base_view import BaseView


class BillingReconciliationView(BaseView):
    status: str
    subscription_id: str | None = None

    @classmethod
    def render(cls, result: dict):
        return cls.model_validate(result)
