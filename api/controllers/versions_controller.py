from fastapi import APIRouter, HTTPException, Depends
from lib.ctx import versions
from controllers.deps import get_current_user
from controllers.input_types import CreateVersion, UpdateVersion
from views import ListVersionView

router = APIRouter(tags=["versions"])


@router.get("/lists/{list_id}/versions")
def list_versions_endpoint(list_id: str, current_user: dict = Depends(get_current_user)):
    return ListVersionView.render_many(versions.list_versions(list_id))


@router.post("/lists/{list_id}/versions", status_code=201)
def create_version_endpoint(list_id: str, data: CreateVersion, current_user: dict = Depends(get_current_user)):
    version = versions.create_version(list_id, data.name)
    if not version:
        raise HTTPException(status_code=404, detail="List not found")
    return ListVersionView.render(version)


@router.get("/versions/{version_id}")
def get_version_endpoint(version_id: str, current_user: dict = Depends(get_current_user)):
    version = versions.get_version(version_id)
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return ListVersionView.render(version, include_items=True)


@router.patch("/versions/{version_id}")
def update_version_endpoint(version_id: str, data: UpdateVersion, current_user: dict = Depends(get_current_user)):
    version = versions.update_version(version_id, **data.model_dump(exclude_unset=True))
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return ListVersionView.render(version)


@router.post("/versions/{version_id}/duplicate", status_code=201)
def duplicate_version_endpoint(version_id: str, name: str | None = None, current_user: dict = Depends(get_current_user)):
    version = versions.duplicate_version(version_id, name)
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return ListVersionView.render(version)
