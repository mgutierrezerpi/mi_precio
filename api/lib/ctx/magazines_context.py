import json

from lib.ctx.identity_context import get_tenant
from models import Magazine, MagazinePage, Tenant
from models.magazine import unique_magazine_slug

CHEESE_FACTORY_JOURNAL_SLUG = "the_cheese_factory_journal"


def list_magazines(tenant_id: str) -> list[Magazine]:
    return list(
        Magazine.select()
        .where(Magazine.tenant == tenant_id)
        .order_by(Magazine.created_at, Magazine.id)
    )


def get_magazine(magazine_id: str) -> Magazine | None:
    return Magazine.get_or_none(Magazine.id == magazine_id)


def create_magazine(tenant_id: str, **values) -> Magazine | None:
    tenant = get_tenant(tenant_id)
    if not tenant:
        return None
    if values.get("name", "").strip().lower() == "the cheese factory journal":
        values["design"] = "pencil-journal"
    return Magazine.create(tenant=tenant, **values)


def update_magazine(magazine_id: str, **updates) -> Magazine | None:
    magazine = get_magazine(magazine_id)
    if not magazine:
        return None
    if updates.get("name") and not updates.get("slug"):
        updates["slug"] = unique_magazine_slug(
            magazine.tenant_id, updates["name"], magazine.id
        )
    if updates.get("slug"):
        updates["slug"] = unique_magazine_slug(
            magazine.tenant_id, updates["slug"], magazine.id
        )
    if magazine.slug == CHEESE_FACTORY_JOURNAL_SLUG:
        updates["design"] = "pencil-journal"
    for key, value in updates.items():
        setattr(magazine, key, value)
    magazine.save()
    return magazine


def delete_magazine(magazine_id: str) -> bool:
    magazine = get_magazine(magazine_id)
    return bool(magazine and magazine.delete_instance())


def create_page(magazine_id: str, **values) -> MagazinePage | None:
    magazine = get_magazine(magazine_id)
    if not magazine:
        return None
    if values.get("content") is not None:
        values["content"] = json.dumps(values["content"], ensure_ascii=False)
    return MagazinePage.create(magazine=magazine, **values)


def get_page(page_id: str) -> MagazinePage | None:
    return MagazinePage.get_or_none(MagazinePage.id == page_id)


def update_page(page_id: str, **updates) -> MagazinePage | None:
    page = get_page(page_id)
    if not page:
        return None
    if "content" in updates and updates["content"] is not None:
        updates["content"] = json.dumps(updates["content"], ensure_ascii=False)
    for key, value in updates.items():
        setattr(page, key, value)
    page.save()
    return page


def delete_page(page_id: str) -> bool:
    page = get_page(page_id)
    return bool(page and page.delete_instance())


def get_published_magazines(
    tenant: Tenant, requested_magazine: str | None = None
) -> list[Magazine]:
    conditions = [Magazine.tenant == tenant.id, Magazine.published]
    if requested_magazine:
        conditions.append(
            (Magazine.id == requested_magazine) | (Magazine.slug == requested_magazine)
        )
    else:
        conditions.append(Magazine.show_on_index)
    return list(
        Magazine.select().where(*conditions).order_by(Magazine.created_at, Magazine.id)
    )


def get_public_magazine(tenant: Tenant, requested_magazine: str) -> Magazine | None:
    magazine = (
        Magazine.select()
        .where(
            (Magazine.tenant == tenant.id)
            & Magazine.published
            & (
                (Magazine.id == requested_magazine)
                | (Magazine.slug == requested_magazine)
            )
        )
        .first()
    )
    return magazine
