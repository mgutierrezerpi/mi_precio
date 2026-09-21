from views.base_view import BaseView


class SupportTicketView(BaseView):
    id: str | int
    status: str = "created"
