from pydantic import BaseModel


class CreateVersion(BaseModel):
    name: str
