from lib.value_objects import AuthResult
from views.base_view import BaseView
from views.user_view import UserView
from views.tenant_view import TenantView


class AuthTokenView(BaseView):
    token: str
    user: UserView
    tenant: TenantView

    @classmethod
    def render(cls, result: AuthResult):
        return cls(
            token=result.token,
            user=UserView.render(result.user),
            tenant=TenantView.render(result.tenant),
        )
