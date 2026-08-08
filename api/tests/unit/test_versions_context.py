"""Tests for versions context."""

from lib.ctx import identity, items, lists, versions
from lib.list_content import deserialize_content
from views.list_version_view import ListVersionView
from views.price_list_view import PriceListView

CONTENT = {
    "schema_version": 1,
    "hero": {
        "eyebrow": "CATÁLOGO ACTUALIZADO",
        "title": "Todo para tu obra",
        "body": "Envíos a todo Uruguay.",
    },
    "blocks": [
        {
            "id": "catalog-main",
            "type": "catalog",
            "sections": [
                {
                    "id": "paint",
                    "title": "Pinturas",
                    "source": {"kind": "category", "value": "Pinturas"},
                }
            ],
        },
        {
            "id": "promotion",
            "type": "promotion_strip",
            "items": ["Envío gratis desde UYU 3.000"],
        },
    ],
}


def test_create_version(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")

    version = versions.create_version(created.price_list.id, "v2")

    assert version is not None
    assert version.name == "v2"
    assert version.version_number == 2


def test_create_version_invalid_list(db):
    version = versions.create_version("nonexistent", "v1")

    assert version is None


def test_get_version(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")

    found = versions.get_version(created.version.id)

    assert found is not None
    assert found.name == "v1"


def test_list_versions(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    versions.create_version(created.price_list.id, "v2")

    result = versions.list_versions(created.price_list.id)

    assert len(result) == 2


def test_update_version(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")

    updated = versions.update_version(
        created.version.id, name="Updated", published=True
    )

    assert updated.name == "Updated"
    assert updated.published is True
    assert updated.published_at is not None


def test_update_version_unpublishes_others(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    v2 = versions.create_version(created.price_list.id, "v2")

    versions.update_version(created.version.id, published=True)
    versions.update_version(v2.id, published=True)

    v1_refreshed = versions.get_version(created.version.id)
    assert v1_refreshed.published is False


def test_duplicate_version(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    items.create_item(created.version.id, name="Pizza", price=100.0)

    duplicated = versions.duplicate_version(created.version.id, "v2")

    assert duplicated is not None
    assert duplicated.name == "v2"
    assert duplicated.version_number == 2
    duplicated_items = items.list_items(duplicated.id)
    assert len(duplicated_items) == 1
    assert duplicated_items[0].name == "Pizza"


def test_duplicate_version_not_found(db):
    duplicated = versions.duplicate_version("nonexistent")

    assert duplicated is None


def test_update_content_replaces_a_version_snapshot(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")

    updated = versions.update_content(created.version.id, CONTENT, 0)

    assert updated is not None
    assert updated.content_revision == 1
    assert deserialize_content(updated.content) == CONTENT


def test_update_content_rejects_a_stale_revision(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    versions.update_content(created.version.id, CONTENT, 0)

    stale_update = versions.update_content(created.version.id, CONTENT, 0)

    assert stale_update is None


def test_update_content_rejects_unknown_block_fields(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    invalid_content = {
        "schema_version": 1,
        "blocks": [{"id": "bad", "type": "contact", "html": "<script>"}],
    }

    try:
        versions.update_content(created.version.id, invalid_content, 0)
    except ValueError as error:
        assert str(error) == "contact block has unknown fields"
    else:
        raise AssertionError("invalid content must be rejected")


def test_duplicate_version_copies_content_as_a_new_revision(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    versions.update_content(created.version.id, CONTENT, 0)

    duplicated = versions.duplicate_version(created.version.id, "v2")

    assert duplicated is not None
    assert deserialize_content(duplicated.content) == CONTENT
    assert duplicated.content_revision == 0


def test_version_view_exposes_deserialized_content(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    versions.update_content(created.version.id, CONTENT, 0)

    view = ListVersionView.render(versions.get_version(created.version.id))

    assert view.content == CONTENT
    assert view.content_revision == 1


def test_price_list_view_accepts_a_list_with_versioned_content(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    created = lists.create_list(tenant.id, "Menu")
    versions.update_content(created.version.id, CONTENT, 0)

    view = PriceListView.render(created.price_list, include_versions=True)

    assert view.versions is not None
    assert view.versions[0].content == CONTENT
