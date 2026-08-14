"""Tenant data that is safe to return from public catalog endpoints."""

from lib.ctx import leads_context as leads
from views.base_view import BaseView


class PublicTenantView(BaseView):
    name: str
    subdomain: str
    currency: str = "UYU"
    logo_url: str | None = None
    brand_color: str | None = None
    description: str | None = None
    list_design: str | None = None
    list_bg_url: str | None = None
    list_bg_overlay: bool = False
    list_hero_color: str | None = None
    delivery_enabled: bool = False
    tax_id: str | None = None
    address: str | None = None
    # Footer social links. `social_whatsapp` is digits; the page builds wa.me.
    social_instagram: str | None = None
    social_facebook: str | None = None
    social_tiktok: str | None = None
    social_website: str | None = None
    social_whatsapp: str | None = None
    # Already resolved: tier includes leads AND the shop turned the form on.
    # Sending the raw toggle would have the page offer a form the server then
    # silently drops, which is the shop's customer typing for nothing.
    leads_enabled: bool = False

    @classmethod
    def render(cls, tenant):
        return cls(
            name=tenant.name,
            subdomain=tenant.subdomain,
            currency=getattr(tenant, "currency", "UYU") or "UYU",
            logo_url=getattr(tenant, "logo_url", None),
            brand_color=getattr(tenant, "brand_color", None),
            description=getattr(tenant, "description", None),
            list_design=getattr(tenant, "list_design", None),
            list_bg_url=getattr(tenant, "list_bg_url", None),
            list_bg_overlay=bool(getattr(tenant, "list_bg_overlay", False)),
            list_hero_color=getattr(tenant, "list_hero_color", None),
            delivery_enabled=bool(getattr(tenant, "delivery_enabled", False)),
            tax_id=getattr(tenant, "tax_id", None),
            address=getattr(tenant, "address", None),
            social_instagram=getattr(tenant, "social_instagram", None),
            social_facebook=getattr(tenant, "social_facebook", None),
            social_tiktok=getattr(tenant, "social_tiktok", None),
            social_website=getattr(tenant, "social_website", None),
            social_whatsapp=getattr(tenant, "social_whatsapp", None),
            leads_enabled=leads.leads_open(tenant),
        )
