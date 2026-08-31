"""Catalog helpers that keep list snapshots synchronized with products."""

from models import Item, ListVersion, PriceList, Product


def next_position(tenant_id: str) -> int:
    """Get the next position for a new product."""
    last = (
        Product.select()
        .where(Product.tenant == tenant_id)
        .order_by(Product.position.desc())
        .first()
    )
    return (last.position + 1) if last else 0


def sync_item_prices(
    tenant_id: str, product_id: str, price, price_list_ids: list[str] | None
) -> None:
    """Apply a catalog price change to the selected list snapshots."""
    version_ids = (
        ListVersion.select(ListVersion.id)
        .join(PriceList)
        .where(PriceList.tenant == tenant_id)
    )
    if price_list_ids is not None:
        version_ids = version_ids.where(PriceList.id.in_(price_list_ids))
    Item.update(price=price).where(
        (Item.list_version.in_(version_ids)) & (Item.product == product_id)
    ).execute()


def sync_item_profile(product_id: str, product: Product) -> None:
    """Keep all list snapshots aligned with global product metadata."""
    Item.update(
        name=product.name,
        description=product.description,
        category=product.category,
        currency=product.currency,
    ).where(Item.product == product_id).execute()


def sync_item_images(
    product_id: str, image_url: str | None, image_thumb_url: str | None
) -> None:
    """Keep image references consistent across product snapshots."""
    Item.update(image_url=image_url, image_thumb_url=image_thumb_url).where(
        Item.product == product_id
    ).execute()


def norm_name(name: str | None) -> str:
    """Normalize a product name for catalog identity comparisons."""
    return (name or "").strip().casefold()
