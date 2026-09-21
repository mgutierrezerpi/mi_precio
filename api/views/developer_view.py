from views.base_view import BaseView


class DeveloperAccessView(BaseView):
    enabled: bool
    user_id: str


class FeatureFlagTenantView(BaseView):
    id: str
    name: str
    subdomain: str
    enabled: bool
    has_override: bool


class FeatureFlagView(BaseView):
    key: str
    description: str | None = None
    default_enabled: bool
    tenants: list[FeatureFlagTenantView]

    @classmethod
    def render_many(cls, flags: list[dict]):
        return [cls.model_validate(flag) for flag in flags]


class FeatureFlagAssignmentView(BaseView):
    key: str
    tenant_id: str
    enabled: bool
