from lib.value_objects import PublishedList
from views.base_view import BaseView
from views.list_version_view import ListVersionView


class PublicListView(BaseView):
    id: str
    name: str
    slug: str | None = None
    kind: str = "product"
    # Which list is the shop's main one. The public page uses it to know whose
    # look to wear when no single list is being shown (e.g. the dead-end screen).
    show_on_index: bool = False
    # Per-list appearance overrides; null means "inherit the tenant default".
    # The public page merges these over the tenant fields when a single list is
    # being shown.
    design: str | None = None
    hero_color: str | None = None
    bg_url: str | None = None
    bg_overlay: bool | None = None
    version: ListVersionView

    @classmethod
    def render(cls, published: PublishedList):
        price_list = published.price_list
        return cls(
            id=price_list.id,
            name=price_list.name,
            slug=price_list.slug,
            kind=getattr(price_list, "kind", "product") or "product",
            show_on_index=bool(getattr(price_list, "show_on_index", False)),
            design=getattr(price_list, "design", None),
            hero_color=getattr(price_list, "hero_color", None),
            bg_url=getattr(price_list, "bg_url", None),
            bg_overlay=getattr(price_list, "bg_overlay", None),
            version=ListVersionView.render(published.version, include_items=True, items=published.items),
        )
