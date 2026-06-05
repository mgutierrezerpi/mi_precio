from pydantic import BaseModel


class CreateCustomer(BaseModel):
    name: str
    rut: str | None = None
    email: str | None = None
    phone: str | None = None
    notes: str | None = None
