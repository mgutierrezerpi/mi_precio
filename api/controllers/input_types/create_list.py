from datetime import datetime

from pydantic import BaseModel, field_validator


class CreateList(BaseModel):
    name: str
    kind: str = "product"
    parent_list_id: str | None = None
    variant_type: str | None = None
    customer_id: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None

    @field_validator("variant_type")
    @classmethod
    def validate_variant_type(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if value not in {"customer", "promotion", "seasonal", "custom"}:
            raise ValueError("Invalid variant type")
        return value
