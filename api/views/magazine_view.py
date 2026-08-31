from datetime import datetime

from models import MagazinePage
from views.base_view import BaseView
from views.magazine_page_view import MagazinePageView


class MagazineView(BaseView):
    id: str
    tenant_id: str
    name: str
    slug: str | None = None
    issue: str | None = None
    description: str | None = None
    design: str
    cover_image_url: str | None = None
    published: bool
    show_on_index: bool
    created_at: datetime
    updated_at: datetime
    pages: list[MagazinePageView] | None = None

    @classmethod
    def render(cls, magazine, include_pages=False):
        data = dict(magazine.__data__)
        data["tenant_id"] = magazine.tenant_id
        data["pages"] = None
        view = cls.model_validate(data)
        if include_pages:
            view.pages = MagazinePageView.render_many(
                magazine.pages.order_by(MagazinePage.position)
            )
        return view

    @classmethod
    def render_many(cls, magazines, include_pages=False):
        return [cls.render(magazine, include_pages) for magazine in magazines]
