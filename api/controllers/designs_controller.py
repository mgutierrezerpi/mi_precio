from fastapi import APIRouter

from lib.list_designs import public_design_specs

router = APIRouter(tags=["list-designs"])


@router.get("/list-designs")
def list_designs_endpoint():
    """The supported semantic content blocks for each public-list design."""
    return public_design_specs()
