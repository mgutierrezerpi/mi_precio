"""Business-specific link-in-bio pages."""

import json
from uuid import uuid4

from lib.ctx.identity_context import get_tenant
from models import LinkTree, Tenant


class SlugTaken(ValueError):
    """The public link belongs to another business."""


def _slug_owner(slug: str) -> str | None:
    """The tenant that owns `slug` as a Linktree link or as its address."""
    tree = LinkTree.get_or_none(LinkTree.public_slug == slug)
    if tree:
        return str(tree.tenant_id)
    tenant = Tenant.get_or_none(Tenant.subdomain == slug)
    return str(tenant.id) if tenant else None


def _free_slug(base: str, tenant_id: str) -> str:
    slug, counter = base, 2
    while (owner := _slug_owner(slug)) and owner != str(tenant_id):
        slug = f"{base}-{counter}"[:63]
        counter += 1
    return slug


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
        # Normally the shop's own address; if another Linktree already took
        # it (they could, before R6), the first free variant instead of a 500.
        public_slug=_free_slug(tenant.subdomain, tenant_id),
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
    # A link already used by another business's Linktree hit the unique index
    # and answered 500; another business's address could be taken outright,
    # breaking its Linktree when it was created later. Both are refused.
    slug = updates.get("public_slug")
    if slug:
        owner = _slug_owner(slug)
        if owner and owner != str(tree.tenant_id):
            raise SlugTaken("Ese link ya lo usa otro negocio. Probá con otro.")
    for key in ("tags", "links"):
        if key in updates:
            updates[key] = _json(updates[key], [])
    for key, value in updates.items():
        setattr(tree, key, value)
    tree.save()
    return tree
