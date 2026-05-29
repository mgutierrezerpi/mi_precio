from datetime import datetime
from views.base_view import BaseView


class TenantView(BaseView):
    id: str
    name: str
    subdomain: str
    currency: str = "UYU"
    created_at: datetime
    updated_at: datetime

    @classmethod
    def render(cls, tenant):
        data = {
            "id": tenant.id,
            "name": tenant.name,
            "subdomain": tenant.subdomain,
            "currency": getattr(tenant, "currency", "UYU") or "UYU",
            "created_at": tenant.created_at,
            "updated_at": tenant.updated_at,
        }
        return cls(**data)

    @classmethod
    def render_many(cls, tenants):
        return [cls.render(t) for t in tenants]
