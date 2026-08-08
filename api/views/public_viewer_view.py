from datetime import datetime

from views.base_view import BaseView


class PublicViewerView(BaseView):
    id: str
    tenant_id: str
    list_id: str
    list_name: str
    name: str
    email: str | None = None
    phone: str | None = None
    customer_id: str | None = None
    ip_address: str | None = None
    view_count: int
    created_at: datetime
    last_seen_at: datetime

    @classmethod
    def render(cls, viewer):
        return cls(
            id=viewer.id,
            tenant_id=viewer.tenant_id,
            list_id=viewer.price_list_id,
            list_name=viewer.price_list.name,
            name=viewer.name,
            email=viewer.email,
            phone=viewer.phone,
            customer_id=viewer.customer_id,
            ip_address=viewer.ip_address,
            view_count=viewer.view_count,
            created_at=viewer.created_at,
            last_seen_at=viewer.last_seen_at,
        )

    @classmethod
    def render_many(cls, viewers):
        return [cls.render(viewer) for viewer in viewers]
