"""Business-specific link-in-bio pages."""

import json
from uuid import uuid4

from lib.ctx.identity_context import get_tenant
from models import LinkTree


def _default_links(subdomain: str) -> list[dict[str, object]]:
    return [
        {
            "id": uuid4().hex,
            "title": "Ver nuestro catálogo",
            "description": "Precios y productos actualizados",
            "url": f"/p/{subdomain}",
            "icon": "bag",
            "style": "featured",
            "enabled": True,
        },
        {
            "id": uuid4().hex,
            "title": "Escribinos por WhatsApp",
            "description": "Respondemos tus consultas",
            "url": "",
            "icon": "chat",
            "style": "light",
            "enabled": True,
        },
    ]


def _json(value: object, fallback: object) -> str:
    return json.dumps(value if value is not None else fallback, ensure_ascii=False)


def get_linktree(tenant_id: str, create: bool = True) -> LinkTree | None:
    tree = LinkTree.get_or_none(LinkTree.tenant == tenant_id)
    if tree or not create:
        return tree
    tenant = get_tenant(tenant_id)
    if not tenant:
        return None
    defaults = _default_links(tenant.subdomain)
    defaults[1]["url"] = tenant.whatsapp_url or ""
    defaults[1]["enabled"] = bool(tenant.whatsapp_url)
    return LinkTree.create(
        tenant=tenant,
        public_slug=tenant.subdomain,
        display_name=tenant.name,
        handle=f"@{tenant.subdomain}",
        bio=tenant.description or "Todo tu negocio en un solo link.",
        tags=_json([], []),
        links=_json(defaults, []),
        template="botanical",
        instagram_url=tenant.instagram_url,
        whatsapp_url=tenant.whatsapp_url,
        website_url=tenant.website_url,
    )


def update_linktree(linktree_id: str, **updates) -> LinkTree | None:
    tree = LinkTree.get_or_none(LinkTree.id == linktree_id)
    if not tree:
        return None
    for key in ("tags", "links"):
        if key in updates:
            updates[key] = _json(updates[key], [])
    for key, value in updates.items():
        setattr(tree, key, value)
    tree.save()
    return tree
