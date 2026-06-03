from pydantic import BaseModel


class UpdateCategory(BaseModel):
    name: str | None = None
    description: str | None = None
    color: str | None = None
