from pydantic import computed_field
from datetime import datetime
from views.base_view import BaseView


class UserView(BaseView):
    id: str
    email: str
    tenant_id: str
    created_at: datetime

    @computed_field
    @property
    def name(self) -> str:
        return self.email.split("@")[0]

    @computed_field
    @property
    def role(self) -> str:
        return "admin"

    @classmethod
    def render(cls, user):
        return cls.model_validate(user)

    @classmethod
    def render_many(cls, users):
        return [cls.render(u) for u in users]
