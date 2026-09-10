from controllers.router import ControllerRouter
from lib.list_designs import public_design_specs

router = ControllerRouter(tags=["list-designs"], plan_gated=True)


@router.get("/list-designs")
def list_designs_endpoint():
    """The supported semantic content blocks for each public-list design."""
    return public_design_specs()
