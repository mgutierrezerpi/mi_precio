from models import Tenant
from lib.value_objects import PublishedList
from views.base_view import BaseView
from views.tenant_view import TenantView
from views.public_list_view import PublicListView


class PublicMenuView(BaseView):
    tenant: TenantView
    lists: list[PublicListView]

    @classmethod
    def render(cls, tenant: Tenant, published_lists: list[PublishedList]):
        return cls(
            tenant=TenantView.render(tenant),
            lists=[PublicListView.render(pl) for pl in published_lists],
        )
