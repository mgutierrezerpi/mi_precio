"""Shared router type and registration metadata for API controllers."""

from fastapi import APIRouter


class ControllerRouter(APIRouter):
    """An API controller router with an optional account-plan requirement."""

    def __init__(self, *args, plan_gated: bool = False, **kwargs):
        super().__init__(*args, **kwargs)
        self.plan_gated = plan_gated
