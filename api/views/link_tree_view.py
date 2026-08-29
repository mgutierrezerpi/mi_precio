import json
from datetime import datetime

from views.base_view import BaseView


def _json_list(value: str | None) -> list:
    try:
        parsed = json.loads(value or "[]")
    except (TypeError, ValueError):
        return []
    return parsed if isinstance(parsed, list) else []


class LinkTreeView(BaseView):
    id: str
    tenant_id: str
    public_slug: str
    display_name: str
    handle: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    accent_color: str
    background_color: str
    template: str
    font: str
    tags: list[str]
    links: list[dict]
    instagram_url: str | None = None
    tiktok_url: str | None = None
    email_url: str | None = None
    whatsapp_url: str | None = None
    website_url: str | None = None
    location_url: str | None = None
    published: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def render(cls, linktree):
        return cls(
            id=linktree.id,
            tenant_id=linktree.tenant_id,
            public_slug=linktree.public_slug,
            display_name=linktree.display_name,
            handle=linktree.handle,
            bio=linktree.bio,
            # A Linktree inherits the business logo unless the owner explicitly
            # chooses a different profile image for this page.
            avatar_url=linktree.avatar_url or linktree.tenant.logo_url,
            accent_color=linktree.accent_color,
            background_color=linktree.background_color,
            template=linktree.template or "botanical",
            font=linktree.font or "sans",
            tags=_json_list(linktree.tags),
            links=_json_list(linktree.links),
            instagram_url=linktree.instagram_url,
            tiktok_url=linktree.tiktok_url,
            email_url=linktree.email_url,
            whatsapp_url=linktree.whatsapp_url,
            website_url=linktree.website_url,
            location_url=linktree.location_url,
            published=bool(linktree.published),
            created_at=linktree.created_at,
            updated_at=linktree.updated_at,
        )
