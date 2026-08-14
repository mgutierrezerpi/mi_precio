from datetime import datetime

from pydantic import Field

from lib.ctx import feature_flags
from views.base_view import BaseView


def _float_or_none(value):
    try:
        return float(value) if value is not None else None
    except (TypeError, ValueError):
        return None


class TenantView(BaseView):
    id: str
    name: str
    subdomain: str
    currency: str = "UYU"
    plan: str = "free"
    # True when this tenant must pick a plan before the CRM opens up.
    plan_gate: bool = False
    logo_url: str | None = None
    brand_color: str | None = None
    description: str | None = None
    list_design: str | None = None
    list_bg_url: str | None = None
    list_bg_overlay: bool = False
    list_hero_color: str | None = None
    language: str = "es"
    timezone: str = "America/Montevideo"
    delivery_enabled: bool = False
    marketplace_enabled: bool = True
    marketplace_latitude: float | None = None
    marketplace_longitude: float | None = None
    business_category: str | None = None
    whatsapp_url: str | None = None
    website_url: str | None = None
    instagram_url: str | None = None
    legal_name: str | None = None
    tax_id: str | None = None
    address: str | None = None
    features: dict[str, bool] = Field(default_factory=dict)
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
            plan_gate=bool(g("plan_gate", False)),
            logo_url=g("logo_url"),
            brand_color=g("brand_color"),
            description=g("description"),
            list_design=g("list_design"),
            list_bg_url=g("list_bg_url"),
            list_bg_overlay=bool(g("list_bg_overlay", False)),
            list_hero_color=g("list_hero_color"),
            language=g("language", "es") or "es",
            timezone=g("timezone", "America/Montevideo") or "America/Montevideo",
            delivery_enabled=bool(g("delivery_enabled", False)),
            marketplace_enabled=bool(g("marketplace_enabled", True)),
            marketplace_latitude=_float_or_none(g("marketplace_latitude")),
            marketplace_longitude=_float_or_none(g("marketplace_longitude")),
            business_category=g("business_category"),
            whatsapp_url=g("whatsapp_url"),
            website_url=g("website_url"),
            instagram_url=g("instagram_url"),
            legal_name=g("legal_name"),
            tax_id=g("tax_id"),
            address=g("address"),
            features=feature_flags.all_for_tenant(tenant.id),
            created_at=tenant.created_at,
            updated_at=tenant.updated_at,
        )

    @classmethod
    def render_many(cls, tenants):
        return [cls.render(t) for t in tenants]
