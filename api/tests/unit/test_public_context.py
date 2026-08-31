"""Tests for public context."""

from lib.ctx import identity, items, lists, products, public, versions
from views.price_list_view import PriceListView
from views.public_tenant_view import PublicTenantView


def test_get_tenant_by_subdomain(db):
    tenant = identity.create_tenant("Test Store", "test-store")

    found = public.get_tenant_by_subdomain("test-store")

    assert found is not None
    assert found.id == tenant.id


def test_get_tenant_by_subdomain_not_found(db):
    found = public.get_tenant_by_subdomain("nonexistent")

    assert found is None


def test_nearby_marketplace_tenants_only_returns_opted_in_businesses(db):
    nearby = identity.create_tenant("Nearby", "nearby")
    nearby.marketplace_enabled = True
    nearby.marketplace_latitude = "-34.9011"
    nearby.marketplace_longitude = "-56.1645"
    nearby.save()

    no_location = identity.create_tenant("No Location", "no-location")
    no_location.marketplace_enabled = True
    no_location.save()

    hidden = identity.create_tenant("Hidden", "hidden")
    hidden.marketplace_enabled = False
    hidden.marketplace_latitude = "-34.9011"
    hidden.marketplace_longitude = "-56.1645"
    hidden.save()

    result = public.nearby_marketplace_tenants(-34.9011, -56.1645)

    assert [(tenant.name, distance) for tenant, distance in result] == [
        ("Nearby", 0.0),
        ("No Location", None),
    ]

    result_without_visitor_location = public.nearby_marketplace_tenants()

    assert [
        (tenant.name, distance) for tenant, distance in result_without_visitor_location
    ] == [
        ("Nearby", None),
        ("No Location", None),
    ]


def test_public_tenant_view_does_not_expose_marketplace_coordinates(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    tenant.marketplace_enabled = True
    tenant.marketplace_latitude = "-34.9011"
    tenant.marketplace_longitude = "-56.1645"
    tenant.save()

    public_tenant = PublicTenantView.render(tenant)

    assert "marketplace_latitude" not in public_tenant.model_dump()
    assert "marketplace_longitude" not in public_tenant.model_dump()


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


def test_get_published_lists_uses_global_product_image(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(
        created.version.id, name="Pizza", price=150.0, image_url="http://img/item.jpg"
    )
    products.create_product(
        tenant.id, name="Pizza", price=150.0, image_url="http://img/product.jpg"
    )
    lists.update_list(created.price_list.id, published=True)
    versions.update_version(created.version.id, published=True)

    result = public.get_published_lists(tenant)

    assert result[0].items[0].image_url == "http://img/product.jpg"


def test_get_published_lists_excludes_unavailable_catalog_items(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    unavailable = products.create_product(
        tenant.id, name="Pizza", price=150.0, available=False
    )
    items.create_item(
        created.version.id,
        name="Pizza",
        price=150.0,
        product_id=unavailable.id,
    )
    items.create_item(created.version.id, name="Manual service", price=200.0)
    lists.update_list(created.price_list.id, published=True)
    versions.update_version(created.version.id, published=True)

    result = public.get_published_lists(tenant)

    assert [item.name for item in result[0].items] == ["Manual service"]
    assert PriceListView.render(created.price_list).item_count == 1


def test_get_published_lists_excludes_legacy_items_by_unavailable_product_name(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    products.create_product(tenant.id, name="Pizza", price=150.0, available=False)
    items.create_item(created.version.id, name="Pizza", price=150.0)
    lists.update_list(created.price_list.id, published=True)
    versions.update_version(created.version.id, published=True)

    result = public.get_published_lists(tenant)

    assert result[0].items == []


def test_get_published_lists_uses_global_product_images(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(
        created.version.id, name="Pizza", price=150.0, image_url="http://img/item.webp"
    )
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

    assert result[0].items[0].image_url == "http://img/product.webp"
    assert result[0].items[0].image_thumb_url == "http://img/product_thumb.webp"


def test_get_published_lists_excludes_unpublished(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Pizza", price=150.0)

    result = public.get_published_lists(tenant)

    assert len(result) == 0
