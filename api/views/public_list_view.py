from lib.value_objects import PublishedList
from views.base_view import BaseView
from views.list_version_view import ListVersionView


class PublicListView(BaseView):
    id: str
    name: str
    slug: str | None = None
    version: ListVersionView

    @classmethod
    def render(cls, published: PublishedList):
        return cls(
            id=published.price_list.id,
            name=published.price_list.name,
            slug=published.price_list.slug,
            version=ListVersionView.render(published.version, include_items=True),
        )
