from lib.ctx import identity, lists, magazines
from views.magazine_view import MagazineView
from views.public_magazine_view import PublicMagazineView


def test_magazine_pages_are_separate_from_price_lists(db):
    tenant = identity.create_tenant("Journal Store", "journal-store")
    magazine = magazines.create_magazine(
        tenant.id,
        name="Autumn Journal",
        issue="Issue 01",
        design="pencil-journal",
        published=True,
    )
    page = magazines.create_page(
        magazine.id,
        position=0,
        page_type="cover",
        title="Cover",
        content={"template": "cover"},
    )

    assert magazine is not None
    assert page is not None
    assert magazines.list_magazines(tenant.id) == [magazine]
    assert MagazineView.render(magazine, include_pages=True).pages[0].content == {
        "template": "cover"
    }
    assert PublicMagazineView.render(magazine).pages[0].title == "Cover"


def test_only_published_magazines_are_public(db):
    tenant = identity.create_tenant("Journal Store", "journal-store")
    magazines.create_magazine(tenant.id, name="Draft", published=False)
    live = magazines.create_magazine(
        tenant.id, name="Live", published=True, show_on_index=True
    )

    assert magazines.get_published_magazines(tenant) == [live]
    assert magazines.get_public_magazine(tenant, "live") == live
    assert magazines.get_public_magazine(tenant, "draft") is None


def test_legacy_magazine_design_is_not_returned_as_a_price_list(db):
    tenant = identity.create_tenant("Journal Store", "journal-store")
    legacy = lists.create_list(tenant.id, "Legacy Journal").price_list
    legacy.design = "pencil-journal"
    legacy.save()
    catalog = lists.create_list(tenant.id, "Current Catalog").price_list

    listed = lists.list_lists(tenant.id)

    assert [row.id for row in listed] == [catalog.id]


def test_cheese_factory_journal_stays_on_its_single_template(db):
    tenant = identity.create_tenant("Journal Store", "journal-store")
    magazine = magazines.create_magazine(
        tenant.id,
        name="The Cheese Factory Journal",
        design="editorial",
    )

    assert magazine is not None
    assert magazine.design == "pencil-journal"

    updated = magazines.update_magazine(magazine.id, design="catalog")

    assert updated is not None
    assert updated.design == "pencil-journal"
