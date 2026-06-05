from pydantic import BaseModel


class UpdateCustomer(BaseModel):
    name: str | None = None
    rut: str | None = None
    email: str | None = None
    phone: str | None = None
    notes: str | None = None
