import re

from pydantic import BaseModel, field_validator

# local@domain.tld, no spaces. Deliberately lenient — just rejects obvious
# non-emails (e.g. "correo-sin-arroba") rather than enforcing full RFC 5322.
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class CreateCustomer(BaseModel):
    name: str
    rut: str | None = None
    email: str | None = None
    phone: str | None = None
    notes: str | None = None
    access_code: str | None = None
    access_list_ids: list[str] | None = None

    @field_validator("email")
    @classmethod
    def _validate_email(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        if not _EMAIL_RE.match(v):
            raise ValueError("Email inválido")
        return v

    @field_validator("access_code")
    @classmethod
    def _validate_access_code(cls, v: str | None) -> str | None:
        if v is None:
            return None
        v = v.strip()
        if not 4 <= len(v) <= 64:
            raise ValueError("Access code must be between 4 and 64 characters")
        return v
