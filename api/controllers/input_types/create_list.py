from pydantic import BaseModel


class CreateList(BaseModel):
    name: str
    kind: str = "product"
