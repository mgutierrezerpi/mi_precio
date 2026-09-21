from views.base_view import BaseView


class ListDesignView(BaseView):
    id: str
    schema_version: int
    blocks: list[str]
    fields: list[str]

    @classmethod
    def render_many(cls, designs: list[dict]):
        return [cls.model_validate(design) for design in designs]
