import json
from datetime import datetime
from pydantic import field_validator
from views.base_view import BaseView


class ActivityView(BaseView):
    id: str
    action: str
    summary: str
    meta: dict | None = None
    actor: str | None
    entity_type: str | None
    entity_id: str | None
    created_at: datetime

    @field_validator("meta", mode="before")
    @classmethod
    def _parse_meta(cls, v):
        # Stored as a JSON string on the model; expose it as an object.
        if isinstance(v, str):
            try:
                return json.loads(v)
            except ValueError:
                return None
        return v

    @classmethod
    def render(cls, activity):
        return cls.model_validate(activity)

    @classmethod
    def render_many(cls, activities):
        return [cls.render(a) for a in activities]
