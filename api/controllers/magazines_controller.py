from fastapi import APIRouter, Depends, HTTPException

from controllers import ownership
from controllers.deps import get_current_user, require_editor
from controllers.input_types import (
    CreateMagazine,
    CreateMagazinePage,
    UpdateMagazine,
    UpdateMagazinePage,
)
from lib.ctx import activity, feature_flags, magazines
from views import DeletedView, MagazinePageView, MagazineView

router = APIRouter(tags=["magazines"])


def _require_magazines(tenant_id: str) -> None:
    if not feature_flags.magazines_enabled(tenant_id):
        raise HTTPException(status_code=404, detail="Not found")


@router.get("/tenants/{tenant_id}/magazines")
def list_magazines_endpoint(
    tenant_id: str, current_user: dict = Depends(get_current_user)
):
    _require_magazines(tenant_id)
    return MagazineView.render_many(
        magazines.list_magazines(tenant_id), include_pages=True
    )


@router.post("/tenants/{tenant_id}/magazines", status_code=201)
def create_magazine_endpoint(
    tenant_id: str,
    data: CreateMagazine,
    current_user: dict = Depends(require_editor),
):
    _require_magazines(tenant_id)
    magazine = magazines.create_magazine(
        tenant_id, **data.model_dump(exclude_unset=True)
    )
    if not magazine:
        raise HTTPException(status_code=422, detail="Tenant not found")
    activity.record(
        tenant_id,
        "magazine.created",
        f"Creó la revista «{magazine.name}»",
        actor=current_user.get("email"),
        actor_id=current_user.get("sub"),
        entity_type="magazine",
        entity_id=magazine.id,
        meta={"name": magazine.name},
    )
    return MagazineView.render(magazine, include_pages=True)


@router.get("/magazines/{magazine_id}")
def get_magazine_endpoint(
    magazine_id: str, current_user: dict = Depends(get_current_user)
):
    magazine = ownership.own_magazine(magazine_id, current_user)
    _require_magazines(magazine.tenant_id)
    return MagazineView.render(magazine, include_pages=True)


@router.patch("/magazines/{magazine_id}")
def update_magazine_endpoint(
    magazine_id: str,
    data: UpdateMagazine,
    current_user: dict = Depends(require_editor),
):
    magazine = ownership.own_magazine(magazine_id, current_user)
    _require_magazines(magazine.tenant_id)
    magazine = magazines.update_magazine(
        magazine_id, **data.model_dump(exclude_unset=True)
    )
    if not magazine:
        raise HTTPException(status_code=404, detail="Magazine not found")
    if data.published is True:
        activity.record(
            magazine.tenant_id,
            "magazine.published",
            f"Publicó la revista «{magazine.name}»",
            actor=current_user.get("email"),
            actor_id=current_user.get("sub"),
            entity_type="magazine",
            entity_id=magazine.id,
            meta={"name": magazine.name},
        )
    return MagazineView.render(magazine, include_pages=True)


@router.delete("/magazines/{magazine_id}")
def delete_magazine_endpoint(
    magazine_id: str, current_user: dict = Depends(require_editor)
):
    magazine = ownership.own_magazine(magazine_id, current_user)
    _require_magazines(magazine.tenant_id)
    if not magazines.delete_magazine(magazine_id):
        raise HTTPException(status_code=404, detail="Magazine not found")
    return DeletedView()


@router.post("/magazines/{magazine_id}/pages", status_code=201)
def create_magazine_page_endpoint(
    magazine_id: str,
    data: CreateMagazinePage,
    current_user: dict = Depends(require_editor),
):
    magazine = ownership.own_magazine(magazine_id, current_user)
    _require_magazines(magazine.tenant_id)
    page = magazines.create_page(magazine_id, **data.model_dump(exclude_unset=True))
    if not page:
        raise HTTPException(status_code=404, detail="Magazine not found")
    return MagazinePageView.render(page)


@router.patch("/magazine-pages/{page_id}")
def update_magazine_page_endpoint(
    page_id: str,
    data: UpdateMagazinePage,
    current_user: dict = Depends(require_editor),
):
    page = ownership.own_magazine_page(page_id, current_user)
    _require_magazines(page.magazine.tenant_id)
    page = magazines.update_page(page_id, **data.model_dump(exclude_unset=True))
    if not page:
        raise HTTPException(status_code=404, detail="Magazine page not found")
    return MagazinePageView.render(page)


@router.delete("/magazine-pages/{page_id}")
def delete_magazine_page_endpoint(
    page_id: str, current_user: dict = Depends(require_editor)
):
    page = ownership.own_magazine_page(page_id, current_user)
    _require_magazines(page.magazine.tenant_id)
    if not magazines.delete_page(page_id):
        raise HTTPException(status_code=404, detail="Magazine page not found")
    return DeletedView()
