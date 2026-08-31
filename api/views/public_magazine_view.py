from models import MagazinePage
from views.base_view import BaseView
from views.magazine_page_view import MagazinePageView


class PublicMagazineView(BaseView):
    id: str
    name: str
    slug: str | None = None
    issue: str | None = None
    description: str | None = None
    design: str
    cover_image_url: str | None = None
    pages: list[MagazinePageView]

    @classmethod
    def render(cls, magazine):
        return cls(
            id=magazine.id,
            name=magazine.name,
            slug=magazine.slug,
            issue=magazine.issue,
            description=magazine.description,
            design=magazine.design,
            cover_image_url=magazine.cover_image_url,
            pages=MagazinePageView.render_many(
                magazine.pages.order_by(MagazinePage.position)
            ),
        )

    @classmethod
    def render_many(cls, magazines):
        return [cls.render(magazine) for magazine in magazines]
