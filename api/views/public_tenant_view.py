"""Tenant data that is safe to return from public catalog endpoints."""

from models import LinkTree
from views.base_view import BaseView


class PublicTenantView(BaseView):
    name: str
    subdomain: str
    currency: str = "UYU"
    logo_url: str | None = None
    brand_color: str | None = None
    # Public catalog pages use the same brand accent as the business's
    # Linktree, keeping the two customer-facing surfaces in sync.
    linktree_accent_color: str | None = None
    description: str | None = None
    list_design: str | None = None
    list_bg_url: str | None = None
    list_bg_overlay: bool = False
    list_hero_color: str | None = None
    social_instagram: str | None = None
    social_facebook: str | None = None
    social_tiktok: str | None = None
    social_website: str | None = None
    social_whatsapp: str | None = None
    leads_enabled: bool = False
    delivery_enabled: bool = False
    tax_id: str | None = None
    address: str | None = None

    @classmethod
    def render(cls, tenant):
        linktree = LinkTree.get_or_none(LinkTree.tenant == tenant)
        return cls(
            name=tenant.name,
            subdomain=tenant.subdomain,
            currency=getattr(tenant, "currency", "UYU") or "UYU",
            logo_url=getattr(tenant, "logo_url", None),
            brand_color=getattr(tenant, "brand_color", None),
            linktree_accent_color=(linktree.accent_color if linktree else None),
            description=getattr(tenant, "description", None),
            list_design=getattr(tenant, "list_design", None),
            list_bg_url=getattr(tenant, "list_bg_url", None),
            list_bg_overlay=bool(getattr(tenant, "list_bg_overlay", False)),
            list_hero_color=getattr(tenant, "list_hero_color", None),
            social_instagram=getattr(tenant, "social_instagram", None),
            social_facebook=getattr(tenant, "social_facebook", None),
            social_tiktok=getattr(tenant, "social_tiktok", None),
            social_website=getattr(tenant, "social_website", None),
            social_whatsapp=getattr(tenant, "social_whatsapp", None),
            leads_enabled=bool(getattr(tenant, "leads_enabled", False)),
            delivery_enabled=bool(getattr(tenant, "delivery_enabled", False)),
            tax_id=getattr(tenant, "tax_id", None),
            address=getattr(tenant, "address", None),
        )
