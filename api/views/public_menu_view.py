from models import Tenant
from lib.value_objects import PublishedList
from views.base_view import BaseView
from views.public_tenant_view import PublicTenantView
from views.public_list_view import PublicListView


class PublicMenuView(BaseView):
    tenant: PublicTenantView
    lists: list[PublicListView]

    @classmethod
    def render(cls, tenant: Tenant, published_lists: list[PublishedList]):
        return cls(
            tenant=PublicTenantView.render(tenant),
            lists=[PublicListView.render(pl) for pl in published_lists],
        )
