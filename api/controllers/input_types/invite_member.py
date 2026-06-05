from pydantic import BaseModel


class InviteMember(BaseModel):
    email: str
    role: str = "viewer"
