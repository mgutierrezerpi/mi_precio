from views.base_view import BaseView


class TeamStatsView(BaseView):
    members: int
    active: int
    pending: int
    roles: int

    @classmethod
    def render(cls, stats: dict):
        return cls.model_validate(stats)
