from pydantic import BaseModel, field_validator
import re


class UpdateTenant(BaseModel):
    name: str | None = None
    subdomain: str | None = None
    currency: str | None = None

    @field_validator("subdomain")
    @classmethod
    def validate_subdomain(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.lower()
        if not re.match(r"^[a-z0-9-]+$", v):
            raise ValueError("Subdomain can only contain lowercase letters, numbers, and hyphens")
        if len(v) < 3:
            raise ValueError("Subdomain must be at least 3 characters")
        if len(v) > 63:
            raise ValueError("Subdomain must be at most 63 characters")
        return v
