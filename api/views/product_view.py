from datetime import datetime
from decimal import Decimal

from pydantic import field_serializer

from views.base_view import BaseView


class ProductView(BaseView):
    id: str
    tenant_id: str
    name: str
    sku: str | None
    price: Decimal
    currency: str
    available: bool
    description: str | None
    image_url: str | None
    image_thumb_url: str | None
    category: str | None
    position: int
    created_at: datetime
    updated_at: datetime
    # The lists that carry this product. The edit modal offers to apply a new
    # price only to these; it used to list every list the shop has.
    price_list_ids: list[str] = []

    @field_serializer("price")
    def serialize_price(self, v):
        return str(v)

    @classmethod
    def render(cls, product, price_list_ids: list[str] | None = None):
        view = cls.model_validate(product)
        view.price_list_ids = (
            price_list_ids
            if price_list_ids is not None
            else _list_ids_by_product([product.id]).get(str(product.id), [])
        )
        return view

    @classmethod
    def render_many(cls, products):
        products = list(products)
        by_product = _list_ids_by_product([p.id for p in products])
        return [cls.render(p, by_product.get(str(p.id), [])) for p in products]


def _list_ids_by_product(product_ids: list) -> dict[str, list[str]]:
    """One query for every product: which lists have an item linked to it."""
    from models import Item, ListVersion

    found: dict[str, set[str]] = {}
    if not product_ids:
        return {}
    rows = (
        Item.select(Item.product, ListVersion.list)
        .join(ListVersion)
        .where(Item.product.in_(product_ids))
        .tuples()
    )
    for product_id, list_id in rows:
        found.setdefault(str(product_id), set()).add(str(list_id))
    return {key: sorted(value) for key, value in found.items()}
