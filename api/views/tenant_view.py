from datetime import datetime
from views.base_view import BaseView


class TenantView(BaseView):
    id: str
    name: str
    subdomain: str
    currency: str = "UYU"
    plan: str = "free"
    logo_url: str | None = None
    brand_color: str | None = None
    description: str | None = None
    language: str = "es"
    timezone: str = "America/Montevideo"
    legal_name: str | None = None
    tax_id: str | None = None
    address: str | None = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def render(cls, tenant):
        def g(attr, default=None):
            return getattr(tenant, attr, default)

        return cls(
            id=tenant.id,
            name=tenant.name,
            subdomain=tenant.subdomain,
            currency=g("currency", "UYU") or "UYU",
            plan=g("plan", "free") or "free",
            logo_url=g("logo_url"),
            brand_color=g("brand_color"),
            description=g("description"),
            language=g("language", "es") or "es",
            timezone=g("timezone", "America/Montevideo") or "America/Montevideo",
            legal_name=g("legal_name"),
            tax_id=g("tax_id"),
            address=g("address"),
            created_at=tenant.created_at,
            updated_at=tenant.updated_at,
        )

    @classmethod
    def render_many(cls, tenants):
        return [cls.render(t) for t in tenants]
