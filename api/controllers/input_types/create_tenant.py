from pydantic import BaseModel, field_validator

from controllers.input_types.tenant_name import clean_tenant_name


class CreateTenant(BaseModel):
    name: str
    subdomain: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        return clean_tenant_name(v)
