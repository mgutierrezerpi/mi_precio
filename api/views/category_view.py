from datetime import datetime
from views.base_view import BaseView


class CategoryView(BaseView):
    id: str
    tenant_id: str
    name: str
    description: str | None
    color: str | None
    position: int
    created_at: datetime
    updated_at: datetime

    @classmethod
    def render(cls, category):
        return cls.model_validate(category)

    @classmethod
    def render_many(cls, categories):
        return [cls.render(c) for c in categories]
