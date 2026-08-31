from lib.value_objects import PublishedList
from models import Tenant
from views.base_view import BaseView
from views.public_list_view import PublicListView
from views.public_magazine_view import PublicMagazineView
from views.public_tenant_view import PublicTenantView


class PublicMenuView(BaseView):
    tenant: PublicTenantView
    lists: list[PublicListView]
    magazines: list[PublicMagazineView]
    viewer_identified: bool = False

    @classmethod
    def render(
        cls,
        tenant: Tenant,
        published_lists: list[PublishedList],
        viewer_identified: bool = False,
        published_magazines=None,
    ):
        return cls(
            tenant=PublicTenantView.render(tenant),
            lists=[PublicListView.render(pl) for pl in published_lists],
            magazines=PublicMagazineView.render_many(published_magazines or []),
            viewer_identified=viewer_identified,
        )
