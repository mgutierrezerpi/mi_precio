"""Tests for public context."""

from lib.ctx import lists, versions, items, products, public, identity


def test_get_tenant_by_subdomain(db):
    tenant = identity.create_tenant("Test Store", "test-store")

    found = public.get_tenant_by_subdomain("test-store")

    assert found is not None
    assert found.id == tenant.id


def test_get_tenant_by_subdomain_not_found(db):
    found = public.get_tenant_by_subdomain("nonexistent")

    assert found is None


def test_get_published_lists(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Pizza", price=150.0)
    lists.update_list(created.price_list.id, published=True)
    versions.update_version(created.version.id, published=True)

    result = public.get_published_lists(tenant)

    assert len(result) == 1
    assert result[0].price_list.id == created.price_list.id
    assert result[0].version.id == created.version.id
    assert len(result[0].items) == 1


def test_get_published_lists_falls_back_to_product_image(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Pizza", price=150.0)
    products.create_product(
        tenant.id,
        name="Pizza",
        price=150.0,
        image_url="http://img/pizza.webp",
        image_thumb_url="http://img/pizza_thumb.webp",
    )
    lists.update_list(created.price_list.id, published=True)
    versions.update_version(created.version.id, published=True)

    result = public.get_published_lists(tenant)

    assert result[0].items[0].image_url == "http://img/pizza.webp"
    assert result[0].items[0].image_thumb_url == "http://img/pizza_thumb.webp"


def test_get_published_lists_keeps_item_image_over_product(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Pizza", price=150.0, image_url="http://img/item.jpg")
    products.create_product(tenant.id, name="Pizza", price=150.0, image_url="http://img/product.jpg")
    lists.update_list(created.price_list.id, published=True)
    versions.update_version(created.version.id, published=True)

    result = public.get_published_lists(tenant)

    assert result[0].items[0].image_url == "http://img/item.jpg"


def test_get_published_lists_adds_missing_thumb_from_product(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Pizza", price=150.0, image_url="http://img/item.webp")
    products.create_product(
        tenant.id,
        name="Pizza",
        price=150.0,
        image_url="http://img/product.webp",
        image_thumb_url="http://img/product_thumb.webp",
    )
    lists.update_list(created.price_list.id, published=True)
    versions.update_version(created.version.id, published=True)

    result = public.get_published_lists(tenant)

    assert result[0].items[0].image_url == "http://img/item.webp"
    assert result[0].items[0].image_thumb_url == "http://img/product_thumb.webp"


def test_get_published_lists_excludes_unpublished(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Pizza", price=150.0)

    result = public.get_published_lists(tenant)

    assert len(result) == 0
