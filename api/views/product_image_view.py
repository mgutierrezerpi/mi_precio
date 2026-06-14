from views.base_view import BaseView


class ProductImageView(BaseView):
    url: str

    @classmethod
    def render(cls, url: str):
        return cls(url=url)
