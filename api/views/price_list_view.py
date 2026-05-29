from datetime import datetime
from views.base_view import BaseView
from views.list_version_view import ListVersionView


class PriceListView(BaseView):
    id: str
    tenant_id: str
    name: str
    published: bool
    show_on_index: bool
    created_at: datetime
    updated_at: datetime
    versions: list[ListVersionView] | None = None

    @classmethod
    def render(cls, price_list, include_versions=False):
        view = cls.model_validate(price_list)
        if include_versions:
            view.versions = ListVersionView.render_many(price_list.versions)
        return view

    @classmethod
    def render_many(cls, lists, include_versions=False):
        return [cls.render(price_list, include_versions) for price_list in lists]
