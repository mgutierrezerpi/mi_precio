from controllers.router import ControllerRouter
from lib.list_designs import public_design_specs
from views import ListDesignView

router = ControllerRouter(tags=["list-designs"], plan_gated=True)


@router.get("/list-designs")
def list_designs_endpoint() -> list[ListDesignView]:
    """The versioned content capabilities for each public-list design."""
    return ListDesignView.render_many(public_design_specs())
