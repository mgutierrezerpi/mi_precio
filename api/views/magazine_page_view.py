import json

from views.base_view import BaseView


class MagazinePageView(BaseView):
    id: str
    magazine_id: str
    position: int
    page_type: str
    title: str | None = None
    image_url: str | None = None
    content: dict | None = None

    @classmethod
    def render(cls, page):
        data = dict(page.__data__)
        data["magazine_id"] = page.magazine_id
        raw_content = data.get("content")
        if isinstance(raw_content, str):
            try:
                data["content"] = json.loads(raw_content)
            except json.JSONDecodeError:
                data["content"] = None
        return cls.model_validate(data)

    @classmethod
    def render_many(cls, pages):
        return [cls.render(page) for page in pages]
