from datetime import datetime
from views.base_view import BaseView


class ActivityView(BaseView):
    id: str
    action: str
    summary: str
    actor: str | None
    entity_type: str | None
    entity_id: str | None
    created_at: datetime

    @classmethod
    def render(cls, activity):
        return cls.model_validate(activity)

    @classmethod
    def render_many(cls, activities):
        return [cls.render(a) for a in activities]
