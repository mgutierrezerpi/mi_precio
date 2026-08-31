"""Products context - tenant-level product catalog operations."""

from infra.storage import object_storage
from lib.ctx import product_images
from lib.ctx.product_images import (
    ProductImageUpload,
    ProductImageUploadError,  # noqa: F401
)
from lib.ctx.product_item_sync import (
    next_position,
    norm_name,
    sync_item_images,
    sync_item_prices,
    sync_item_profile,
)
from models import Item, ListVersion, PriceList, Product, Tenant


def upload_product_image(
    tenant_id: str, content_type: str, data: bytes
) -> ProductImageUpload | None:
    """Upload an image while preserving this module's storage patch point."""
    return product_images.upload_product_image(
        tenant_id, content_type, data, object_storage
    )


def list_products(tenant_id: str) -> list[Product]:
    """Get all products for a tenant, ordered by position."""
    return list(
        Product.select()
        .where(Product.tenant == tenant_id)
        .order_by(Product.position, Product.created_at)
    )


def get_product(product_id: str) -> Product | None:
    """Get a product by ID."""
    return Product.get_or_none(Product.id == product_id)


def create_product(tenant_id: str, **attrs) -> Product | None:
    """Create or update the tenant-global product with this name.

    Product names are the human-facing identity used by imports and older list
    data, so creating the same product twice should not create two catalogs.
    """
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return None
    existing = find_product_by_name(tenant_id, attrs.get("name"))
    if existing:
        return update_product(existing.id, **attrs)
    return Product.create(
        tenant=tenant,
        position=next_position(tenant_id),
        **attrs,
    )


def find_product_by_name(tenant_id: str, name: str | None) -> Product | None:
    """Find a tenant product by its normalized, case-insensitive name."""
    normalized = norm_name(name)
    if not normalized:
        return None
    for product in Product.select().where(Product.tenant == tenant_id):
        if norm_name(product.name) == normalized:
            return product
    return None


def backfill_orphan_items() -> int:
    """Attach legacy list items to tenant-global products.

    Older imports created list snapshots without a product link. Reusing the
    first product with the same name keeps those snapshots visible while making
    the catalog complete for the Products screen. Rows whose old list relation
    is already broken are skipped so a corrupt legacy snapshot cannot prevent
    the API from starting.
    """
    linked = 0
    tenant_field = PriceList.tenant_id.alias("tenant_id")
    version_tenants = {
        row["id"]: row["tenant_id"]
        for row in ListVersion.select(ListVersion.id, tenant_field)
        .join(PriceList)
        .dicts()
    }
    for item in Item.select().where(Item.product.is_null()):
        tenant_id = version_tenants.get(item.list_version_id)
        if not tenant_id:
            continue
        product = find_product_by_name(tenant_id, item.name)
        if not product:
            tenant = Tenant.get_by_id(tenant_id)
            product = Product.create(
                tenant=tenant,
                name=item.name,
                price=item.price,
                currency=item.currency,
                description=item.description,
                image_url=item.image_url,
                image_thumb_url=item.image_thumb_url,
                category=item.category,
                position=next_position(tenant_id),
            )
        item.product = product
        item.save()
        linked += 1
    return linked


def update_product(product_id: str, **updates) -> Product | None:
    """Update a product's properties.

    `updates` only contains fields the client explicitly sent (the controller
    uses `exclude_unset`), so every one is applied — including `None`/empty,
    which lets the client clear optional fields (sku, category, description…).
    """
    product = get_product(product_id)
    if not product:
        return None
    price_list_ids = updates.pop("price_list_ids", None)
    for key, value in updates.items():
        setattr(product, key, value)
    product.save()
    if "price" in updates:
        sync_item_prices(product.tenant_id, product.id, product.price, price_list_ids)
    if any(
        field in updates for field in ("name", "description", "category", "currency")
    ):
        sync_item_profile(product.id, product)
    if "image_url" in updates or "image_thumb_url" in updates:
        sync_item_images(product.id, product.image_url, product.image_thumb_url)
    return product


def delete_product(product_id: str) -> bool:
    """Delete a product."""
    product = get_product(product_id)
    if not product:
        return False
    Item.delete().where(Item.product == product.id).execute()
    product.delete_instance()
    return True
