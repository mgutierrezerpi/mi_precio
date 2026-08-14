from datetime import datetime
from views.base_view import BaseView


class LeadView(BaseView):
    id: str
    tenant_id: str
    name: str
    phone: str | None
    email: str | None
    message: str | None
    list_id: str | None
    list_name: str | None
    source: str
    status: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def render(cls, lead):
        return cls.model_validate(lead)

    @classmethod
    def render_many(cls, leads):
        return [cls.render(lead) for lead in leads]
