from datetime import datetime
from views.base_view import BaseView
from views.item_view import ItemView


class ListVersionView(BaseView):
    id: str
    list_id: str
    version_number: int
    name: str
    published: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    items: list[ItemView] | None = None

    @classmethod
    def render(cls, version, include_items=False):
        view = cls.model_validate(version)
        if include_items:
            from models import Item
            view.items = ItemView.render_many(version.items.order_by(Item.position))
        return view

    @classmethod
    def render_many(cls, versions, include_items=False):
        return [cls.render(v, include_items) for v in versions]
