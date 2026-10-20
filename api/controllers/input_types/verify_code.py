from pydantic import BaseModel

from controllers.input_types.login_email import LoginEmail


class VerifyCode(BaseModel):
    email: LoginEmail
    code: str
