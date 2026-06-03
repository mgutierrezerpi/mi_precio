from datetime import datetime
from views.base_view import BaseView
from views.list_version_view import ListVersionView


def _item_count(price_list) -> int:
    """Number of items in the list's most recent version."""
    from models import ListVersion, Item

    version = (
        ListVersion.select()
        .where(ListVersion.list == price_list.id)
        .order_by(ListVersion.version_number.desc())
        .first()
    )
    if not version:
        return 0
    return Item.select().where(Item.list_version == version.id).count()


class PriceListView(BaseView):
    id: str
    tenant_id: str
    name: str
    slug: str | None = None
    published: bool
    show_on_index: bool
    item_count: int = 0
    created_at: datetime
    updated_at: datetime
    versions: list[ListVersionView] | None = None

    @classmethod
    def render(cls, price_list, include_versions=False):
        view = cls.model_validate(price_list)
        view.item_count = _item_count(price_list)
        if include_versions:
            view.versions = ListVersionView.render_many(price_list.versions)
        return view

    @classmethod
    def render_many(cls, lists, include_versions=False):
        return [cls.render(price_list, include_versions) for price_list in lists]
