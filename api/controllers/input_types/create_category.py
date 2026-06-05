from pydantic import BaseModel


class CreateCategory(BaseModel):
    name: str
    description: str | None = None
    color: str | None = None
