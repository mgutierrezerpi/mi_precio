"""«Actualizado …» follows every real change to a list, and only real ones (N9)."""

from datetime import datetime

import pytest

from lib.ctx import categories, identity, items, lists, products
from models import ListVersion

LONG_AGO = datetime(2026, 1, 1, 12, 0, 0)


@pytest.fixture
def shop(db):
    tenant = identity.create_tenant("Café", "cafe-n9")
    created = lists.create_list(tenant.id, "Carta")
    product = products.create_product(
        tenant.id, name="Espresso", price=100, category="Bebidas"
    )
    item = items.create_item(created.version.id, product_id=product.id, price=100)
    _age(created.version.id)
    return tenant, created.version.id, product, item


def _age(version_id):
    ListVersion.update(updated_at=LONG_AGO).where(ListVersion.id == version_id).execute()


def _stamp(version_id):
    return ListVersion.get_by_id(version_id).updated_at


def test_editing_an_item_price_updates_the_list(shop):
    _, version_id, _, item = shop
    items.update_item(item.id, price=150)
    assert _stamp(version_id) > LONG_AGO


def test_resaving_an_item_unchanged_keeps_the_date(shop):
    _, version_id, _, item = shop
    items.update_item(item.id, price="100.00", name="Espresso")
    assert _stamp(version_id) == LONG_AGO


def test_adding_and_removing_items_updates_the_list(shop):
    tenant, version_id, _, item = shop
    other = products.create_product(tenant.id, name="Cortado", price=120)
    added = items.create_item(version_id, product_id=other.id, price=120)
    assert _stamp(version_id) > LONG_AGO

    _age(version_id)
    items.delete_item(added.id)
    assert _stamp(version_id) > LONG_AGO
    assert items.get_item(item.id) is not None


def test_reordering_updates_the_list_only_when_the_order_changes(shop):
    tenant, version_id, _, item = shop
    other = products.create_product(tenant.id, name="Cortado", price=120)
    second = items.create_item(version_id, product_id=other.id, price=120)
    _age(version_id)

    items.reorder_items(version_id, [item.id, second.id])
    assert _stamp(version_id) == LONG_AGO

    items.reorder_items(version_id, [second.id, item.id])
    assert _stamp(version_id) > LONG_AGO


def test_catalog_price_change_updates_only_the_lists_it_reaches(shop):
    tenant, version_id, product, _ = shop
    other = lists.create_list(tenant.id, "Mayorista")
    items.create_item(other.version.id, product_id=product.id, price=100)
    _age(other.version.id)

    products.update_product(product.id, price=130, price_list_ids=[other.price_list.id])

    assert _stamp(other.version.id) > LONG_AGO
    assert _stamp(version_id) == LONG_AGO


def test_catalog_price_already_on_the_list_keeps_the_date(shop):
    _, version_id, product, item = shop
    items.update_item(item.id, price=130)
    _age(version_id)

    products.update_product(product.id, price=130)

    assert _stamp(version_id) == LONG_AGO


@pytest.mark.parametrize(
    "change",
    [
        {"name": "Doble espresso"},
        {"description": "Tostado claro"},
        {"category": "Cafés"},
        {"image_url": "https://example.com/espresso.webp"},
        {"available": False},
    ],
)
def test_catalog_profile_change_updates_the_list(shop, change):
    _, version_id, product, _ = shop
    products.update_product(product.id, **change)
    assert _stamp(version_id) > LONG_AGO


def test_saving_the_product_form_untouched_keeps_the_date(shop):
    _, version_id, product, _ = shop
    products.update_product(
        product.id,
        name="Espresso",
        price=100,
        category="Bebidas",
        description=None,
        available=True,
    )
    assert _stamp(version_id) == LONG_AGO


def test_private_product_data_does_not_count_as_a_list_change(shop):
    _, version_id, product, _ = shop
    products.update_product(product.id, sku="ESP-1")
    assert _stamp(version_id) == LONG_AGO


def test_deleting_a_product_updates_the_lists_that_showed_it(shop):
    _, version_id, product, _ = shop
    products.delete_product(product.id)
    assert _stamp(version_id) > LONG_AGO


def test_renaming_or_deleting_a_category_updates_the_list(shop):
    tenant, version_id, _, _ = shop
    category = categories.create_category(tenant.id, name="Bebidas")

    categories.update_category(category.id, name="Bebidas calientes")
    assert _stamp(version_id) > LONG_AGO

    _age(version_id)
    categories.delete_category(category.id)
    assert _stamp(version_id) > LONG_AGO


def test_touching_a_list_does_not_invalidate_the_open_editor(shop):
    _, version_id, _, item = shop
    revision = ListVersion.get_by_id(version_id).content_revision
    items.update_item(item.id, price=150)
    assert ListVersion.get_by_id(version_id).content_revision == revision
