import re

from pydantic import BaseModel, Field, model_validator


class PublicViewerCapture(BaseModel):
    list_id: str = Field(min_length=1, max_length=32)
    name: str = Field(min_length=1, max_length=255)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)

    @model_validator(mode="after")
    def validate_contact(self):
        self.name = self.name.strip()
        if not self.name:
            raise ValueError("Name is required")
        if self.email:
            self.email = self.email.strip().lower()
            if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", self.email):
                raise ValueError("Enter a valid email or phone number")
        if self.phone:
            self.phone = self.phone.strip()
        if not self.email and not self.phone:
            raise ValueError("Email or phone is required")
        return self
