from pydantic import BaseModel

from controllers.input_types.login_email import LoginEmail


class CreateCode(BaseModel):
    email: LoginEmail
