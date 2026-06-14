from datetime import datetime
from views.base_view import BaseView


class UserView(BaseView):
    id: str
    email: str
    tenant_id: str
    role: str
    name: str
    simple_admin_ui: bool = False
    created_at: datetime
    updated_at: datetime
    last_seen_at: datetime | None = None

    @classmethod
    def render(cls, user):
        return cls(
            id=user.id,
            email=user.email,
            tenant_id=user.tenant_id,
            role=user.role or "owner",
            name=user.name or user.email.split("@")[0],
            simple_admin_ui=bool(getattr(user, "simple_admin_ui", False)),
            created_at=user.created_at,
            updated_at=user.updated_at,
            last_seen_at=getattr(user, "last_seen_at", None),
        )

    @classmethod
    def render_many(cls, users):
        return [cls.render(u) for u in users]
