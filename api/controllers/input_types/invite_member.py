from pydantic import BaseModel

from controllers.input_types.login_email import LoginEmail


class InviteMember(BaseModel):
    email: LoginEmail
    role: str = "viewer"
