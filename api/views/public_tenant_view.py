"""Tenant data that is safe to return from public catalog endpoints."""

from views.base_view import BaseView
from models import LinkTree


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
            delivery_enabled=bool(getattr(tenant, "delivery_enabled", False)),
            tax_id=getattr(tenant, "tax_id", None),
            address=getattr(tenant, "address", None),
        )
