from datetime import datetime
from views.base_view import BaseView


class InvitationView(BaseView):
    id: str
    email: str
    role: str
    status: str
    created_at: datetime

    @classmethod
    def render(cls, invitation):
        return cls.model_validate(invitation)

    @classmethod
    def render_many(cls, invitations):
        return [cls.render(i) for i in invitations]
