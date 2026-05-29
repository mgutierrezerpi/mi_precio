from pydantic import BaseModel, EmailStr


class CreateCode(BaseModel):
    email: EmailStr
