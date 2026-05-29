from pydantic import BaseModel


class CreateTenant(BaseModel):
    name: str
    subdomain: str
