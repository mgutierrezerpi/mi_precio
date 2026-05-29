from pydantic import BaseModel


class ExtractedItem(BaseModel):
    name: str
    price: float
    description: str | None = None


class ExtractedItemsView(BaseModel):
    items: list[ExtractedItem]
    count: int

    @classmethod
    def render(cls, items: list) -> "ExtractedItemsView":
        return cls(
            items=[
                ExtractedItem(
                    name=item.name,
                    price=item.price,
                    description=item.description,
                )
                for item in items
            ],
            count=len(items),
        )
