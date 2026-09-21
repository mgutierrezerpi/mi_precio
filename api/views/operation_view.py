from views.base_view import BaseView


class OkView(BaseView):
    ok: bool = True


class UrlView(BaseView):
    url: str
