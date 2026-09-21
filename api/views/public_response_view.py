from views.base_view import BaseView
from views.link_tree_view import LinkTreeView
from views.public_magazine_view import PublicMagazineView
from views.public_tenant_view import PublicTenantView


class MarketplaceTenantView(BaseView):
    name: str
    subdomain: str
    logo_url: str | None = None
    description: str | None = None
    address: str | None = None
    business_category: str | None = None
    whatsapp_url: str | None = None
    website_url: str | None = None
    instagram_url: str | None = None
    distance_km: float | None = None

    @classmethod
    def render(cls, tenant, distance_km: float | None):
        return cls(
            name=tenant.name,
            subdomain=tenant.subdomain,
            logo_url=tenant.logo_url,
            description=tenant.description,
            address=tenant.address,
            business_category=tenant.business_category,
            whatsapp_url=tenant.whatsapp_url,
            website_url=tenant.website_url,
            instagram_url=tenant.instagram_url,
            distance_km=distance_km,
        )


class PublicMagazineResponseView(BaseView):
    tenant: PublicTenantView
    magazine: PublicMagazineView

    @classmethod
    def render(cls, tenant, magazine):
        return cls(
            tenant=PublicTenantView.render(tenant),
            magazine=PublicMagazineView.render(magazine),
        )


class LinkTreeTenantView(BaseView):
    name: str
    subdomain: str


class PublicLinkTreeView(BaseView):
    tenant: LinkTreeTenantView
    linktree: LinkTreeView

    @classmethod
    def render(cls, tenant, linktree: LinkTreeView):
        return cls(
            tenant=LinkTreeTenantView(name=tenant.name, subdomain=tenant.subdomain),
            linktree=linktree,
        )


class PublicViewerStatsView(BaseView):
    anonymous_dismissals: int
