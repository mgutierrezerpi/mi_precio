from pydantic import BaseModel


class UpdateList(BaseModel):
    name: str | None = None
    slug: str | None = None
    published: bool | None = None
    show_on_index: bool | None = None
