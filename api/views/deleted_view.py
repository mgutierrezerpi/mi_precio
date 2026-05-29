from views.base_view import BaseView


class DeletedView(BaseView):
    deleted: bool = True
