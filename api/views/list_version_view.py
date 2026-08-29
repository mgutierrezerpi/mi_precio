from datetime import datetime

from lib.list_content import deserialize_content
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
    content: dict | None = None
    content_revision: int = 0
    items: list[ItemView] | None = None

    @classmethod
    def render(cls, version, include_items=False, items=None):
        data = dict(version.__data__)
        data["list_id"] = version.list_id
        data["content"] = deserialize_content(version.content)
        view = cls.model_validate(data)
        if include_items:
            from models import Item

            source = (
                items if items is not None else version.items.order_by(Item.position)
            )
            view.items = ItemView.render_many(source)
        return view

    @classmethod
    def render_many(cls, versions, include_items=False):
        return [cls.render(v, include_items) for v in versions]
