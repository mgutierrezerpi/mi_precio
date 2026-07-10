from views.base_view import BaseView


class ProductImageView(BaseView):
    url: str
    thumbnail_url: str

    @classmethod
    def render(cls, upload):
        return cls(url=upload["url"], thumbnail_url=upload["thumbnail_url"])
