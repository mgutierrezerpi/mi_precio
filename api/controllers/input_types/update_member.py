from pydantic import BaseModel


class UpdateMember(BaseModel):
    role: str
