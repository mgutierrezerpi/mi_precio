from pydantic import BaseModel


class UpdateMember(BaseModel):
    role: str | None = None
    name: str | None = None
    email: str | None = None
