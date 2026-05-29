from pydantic import BaseModel


class ReorderItems(BaseModel):
    item_ids: list[str]
