from pydantic import BaseModel

from controllers.input_types.login_email import LoginEmail


class UpdateMember(BaseModel):
    role: str | None = None
    name: str | None = None
    email: LoginEmail | None = None
