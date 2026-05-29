from views.base_view import BaseView


class CodeSentView(BaseView):
    message: str = "Code sent"
    email: str

    @classmethod
    def render(cls, email: str):
        return cls(email=email)
