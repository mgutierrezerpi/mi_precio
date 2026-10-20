"""«media_kit» only opens the lead inbox for a real, published media kit (R7)."""

from lib.ctx import identity, leads
from models import Lead, Magazine


def _closed_shop(subdomain):
    # Free plan, leads switched off: the price-list form is closed.
    return identity.create_tenant("Café", subdomain)


def test_claiming_media_kit_does_not_open_a_closed_shop(db):
    tenant = _closed_shop("cafe-r7")
    lead = leads.create_lead(
        tenant.id, name="Spam", email="spam@x.com", source="media_kit"
    )
    assert lead is None
    assert Lead.select().count() == 0


def test_a_published_media_kit_still_takes_enquiries(db):
    tenant = _closed_shop("cafe-r7b")
    kit = Magazine.create(
        tenant=tenant, name="Media kit", design="cafecitos-media-kit", published=True
    )
    lead = leads.create_lead(
        tenant.id,
        name="Marca",
        email="marca@x.com",
        source="media_kit",
        list_id=kit.id,
    )
    assert lead is not None and lead.source == "media_kit"


def test_an_unpublished_kit_or_another_magazine_does_not_count(db):
    tenant = _closed_shop("cafe-r7c")
    draft = Magazine.create(
        tenant=tenant, name="Kit", design="cafecitos-media-kit", published=False
    )
    other = Magazine.create(tenant=tenant, name="Revista", published=True)
    for magazine in (draft, other):
        assert (
            leads.create_lead(
                tenant.id,
                name="X",
                email="x@x.com",
                source="media_kit",
                list_id=magazine.id,
            )
            is None
        )
