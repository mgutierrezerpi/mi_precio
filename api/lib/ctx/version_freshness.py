"""Keep «Actualizado …» on public lists honest.

A version's rows live in other tables (items, and the catalog products overlaid
on them), so saving those never reaches ``ListVersion.updated_at`` by itself.
Callers report a change only when something visible really changed: the product
form resends every field, and saving it untouched must not read as new prices.
"""

from collections.abc import Iterable

from peewee import fn

from models import Item, ListVersion, Product
from models.base import utc_now


def touch_versions(version_ids: Iterable[str]) -> None:
    """Stamp these versions as changed, leaving ``content_revision`` alone."""
    ids = list(set(version_ids))
    if ids:
        ListVersion.update(updated_at=utc_now()).where(
            ListVersion.id.in_(ids)
        ).execute()


def touch_product_versions(product_id: str) -> None:
    """Stamp every version that shows this product."""
    touch_versions(
        item.list_version_id
        for item in Item.select(Item.list_version).where(Item.product == product_id)
    )


def touch_category_versions(tenant_id: str, category_name: str) -> None:
    """Stamp every version showing a product of this category.

    Same case-insensitive match as the category cascade: a product's category
    is free text and may differ from the category record only in casing.
    """
    touch_versions(
        item.list_version_id
        for item in Item.select(Item.list_version)
        .join(Product, on=(Item.product == Product.id))
        .where(
            (Product.tenant == tenant_id)
            & (fn.LOWER(Product.category) == category_name.lower())
        )
    )
