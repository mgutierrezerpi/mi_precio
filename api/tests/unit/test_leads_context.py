"""Inbound contacts captured on a shop's public list."""

import pytest

from lib.ctx import identity, leads, plans
from lib.ctx.leads_context import LeadRejected
from models import Activity, Customer, Lead, Tenant

_n = 0


def _shop(plan="plus", enabled=True):
    """A tenant that is taking leads, unless a test says otherwise."""
    global _n
    _n += 1
    tenant = identity.create_tenant(f"Store {_n}", f"store_{_n}")
    plans.set_plan(tenant.id, plan)
    # Re-read: set_plan saved through its own instance, so the one we hold is
    # now stale and saving it would write the old plan back over it.
    tenant = Tenant.get_by_id(tenant.id)
    tenant.leads_enabled = enabled
    tenant.save()
    return tenant


class TestWhoCanReceiveLeads:
    def test_a_paid_tier_with_the_form_on_takes_them(self, db):
        assert leads.create_lead(_shop().id, "Ana", phone="+598 99 123 456")

    def test_a_tier_without_the_feature_takes_none(self, db):
        # Even with the toggle on: the tier is what decides.
        assert leads.create_lead(_shop(plan="micro").id, "Ana", phone="59899123456") is None

    def test_a_shop_that_turned_it_off_takes_none(self, db):
        assert leads.create_lead(_shop(enabled=False).id, "Ana", phone="59899123456") is None

    def test_a_closed_shop_refuses_silently_rather_than_erroring(self, db):
        # The visitor did nothing wrong, and the form may have been on when the
        # page was loaded: answer the same either way, store nothing.
        shop = _shop(enabled=False)
        assert leads.create_lead(shop.id, "Ana", phone="59899123456") is None
        assert leads.list_leads(shop.id) == []


class TestValidation:
    def test_a_phone_is_stored_as_digits_for_the_wa_me_link(self, db):
        lead = leads.create_lead(_shop().id, "Ana", phone="+598 99 123 456")
        assert lead.phone == "59899123456"

    def test_junk_in_the_phone_is_dropped_rather_than_stored(self, db):
        lead = leads.create_lead(_shop().id, "Ana", phone="no tengo", email="a@b.com")
        assert lead.phone is None

    def test_a_bad_email_is_dropped_rather_than_stored(self, db):
        lead = leads.create_lead(_shop().id, "Ana", phone="59899123456", email="ana")
        assert lead.email is None

    def test_a_lead_with_no_way_to_answer_is_refused(self, db):
        # The whole point is being able to reply.
        with pytest.raises(LeadRejected):
            leads.create_lead(_shop().id, "Ana", phone="12", email="ana")

    def test_a_nameless_lead_is_refused(self, db):
        with pytest.raises(LeadRejected):
            leads.create_lead(_shop().id, "   ", phone="59899123456")

    def test_an_enormous_message_is_cut_rather_than_refused(self, db):
        lead = leads.create_lead(
            _shop().id, "Ana", phone="59899123456", message="x" * 5000
        )
        assert len(lead.message) == 2000

    def test_an_unknown_source_falls_back_to_the_form(self, db):
        lead = leads.create_lead(
            _shop().id, "Ana", phone="59899123456", source="carrier-pigeon"
        )
        assert lead.source == "form"


class TestTheInbox:
    def test_newest_first_because_it_is_an_inbox(self, db):
        shop = _shop()
        leads.create_lead(shop.id, "Primera", phone="59899123456")
        leads.create_lead(shop.id, "Segunda", phone="59899123457")

        assert [lead.name for lead in leads.list_leads(shop.id)][0] == "Segunda"

    def test_leads_stay_inside_their_shop(self, db):
        a, b = _shop(), _shop()
        leads.create_lead(a.id, "De A", phone="59899123456")

        assert leads.list_leads(b.id) == []

    def test_can_be_filtered_by_status(self, db):
        shop = _shop()
        lead = leads.create_lead(shop.id, "Ana", phone="59899123456")
        leads.set_status(lead.id, "contacted")

        assert len(leads.list_leads(shop.id, status="contacted")) == 1
        assert leads.list_leads(shop.id, status="new") == []

    def test_an_invented_status_is_refused(self, db):
        lead = leads.create_lead(_shop().id, "Ana", phone="59899123456")
        assert leads.set_status(lead.id, "muy-interesado") is None


class TestConverting:
    def test_a_lead_becomes_a_customer_with_its_details(self, db):
        shop = _shop()
        lead = leads.create_lead(
            shop.id, "Ana", phone="59899123456", email="a@b.com", message="Hola"
        )

        customer = leads.convert_to_customer(lead.id)

        assert customer.name == "Ana"
        assert customer.phone == "59899123456"
        assert customer.email == "a@b.com"
        assert customer.notes == "Hola"
        assert Lead.get_by_id(lead.id).status == "converted"

    def test_converting_twice_does_not_duplicate_the_customer(self, db):
        # Clicking twice is likelier than wanting the same person recorded again.
        shop = _shop()
        lead = leads.create_lead(shop.id, "Ana", phone="59899123456")
        leads.convert_to_customer(lead.id)

        assert leads.convert_to_customer(lead.id) is None
        assert Customer.select().where(Customer.tenant == shop.id).count() == 1


class TestNotifying:
    def test_a_new_lead_shows_up_in_the_activity_feed(self, db):
        shop = _shop()
        leads.create_lead(shop.id, "Ana", phone="59899123456", source="cart")

        entry = Activity.get(Activity.tenant == shop.id)
        assert entry.action == "lead.created"
        assert "Ana" in entry.summary
