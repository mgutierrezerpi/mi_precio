from views.activity_view import ActivityView
from views.base_view import BaseView


class NotificationPreferencesView(BaseView):
    prefs: dict[str, bool]


class NotificationListView(NotificationPreferencesView):
    items: list[ActivityView]
    unread: int

    @classmethod
    def render(cls, data: dict):
        return cls(
            items=ActivityView.render_many(data["items"]),
            unread=data["unread"],
            prefs=data["prefs"],
        )


class PushConfigView(BaseView):
    key: str
    enabled: bool
