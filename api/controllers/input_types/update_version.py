from pydantic import BaseModel


class UpdateVersion(BaseModel):
    name: str | None = None
    published: bool | None = None
