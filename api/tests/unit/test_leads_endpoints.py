"""The public form endpoint and the CRM's leads routes."""

import pytest

from lib import encode_token, rate_limit
from lib.ctx import identity, leads, plans
from models import Lead, Tenant


def _auth(tenant_id, role="owner"):
    token = encode_token("user-1", "user@shop.com", tenant_id, role)
    return {"Authorization": f"Bearer {token}"}


def _plus_shop(enabled=True):
    """A shop on a tier that has leads, with the form switched on."""
    return _shop(plan="plus", enabled=enabled)


_n = 0


def _shop(plan="plus", enabled=True):
    global _n
    _n += 1
    tenant = identity.create_tenant(f"Store {_n}", f"store_{_n}")
    plans.set_plan(tenant.id, plan)
    tenant = Tenant.get_by_id(tenant.id)
    tenant.leads_enabled = enabled
    tenant.save()
    return tenant


@pytest.fixture(autouse=True)
def _clean_limiter():
    # The limiter is process-wide, so one test's hits would starve the next.
    rate_limit.reset()
    yield
    rate_limit.reset()


class TestThePublicForm:
    def test_a_visitor_can_leave_their_details(self, client, db):
        shop = _shop()

        res = client.post(
            f"/api/v1/public/{shop.subdomain}/leads",
            json={"name": "Ana", "phone": "+598 99 123 456"},
        )

        assert res.status_code == 201
        assert [lead.name for lead in leads.list_leads(shop.id)] == ["Ana"]

    def test_a_shop_not_taking_leads_still_answers_normally(self, client, db):
        # Never tell a stranger the business is on the wrong plan, or that the
        # form was switched off while they were typing.
        shop = _shop(plan="micro")

        res = client.post(
            f"/api/v1/public/{shop.subdomain}/leads",
            json={"name": "Ana", "phone": "59899123456"},
        )

        assert res.status_code == 201
        assert leads.list_leads(shop.id) == []

    def test_a_missing_shop_is_a_404(self, client, db):
        res = client.post(
            "/api/v1/public/no-such-shop/leads",
            json={"name": "Ana", "phone": "59899123456"},
        )
        assert res.status_code == 404

    def test_something_they_can_fix_is_told_to_them(self, client, db):
        shop = _shop()

        res = client.post(
            f"/api/v1/public/{shop.subdomain}/leads",
            json={"name": "Ana", "phone": "nope", "email": "nope"},
        )

        assert res.status_code == 400
        assert "teléfono" in res.json()["detail"]

    def test_a_filled_honeypot_is_swallowed(self, client, db):
        # A real form keeps that field hidden and empty; bots fill everything.
        shop = _shop()

        res = client.post(
            f"/api/v1/public/{shop.subdomain}/leads",
            json={"name": "Bot", "phone": "59899123456", "website": "http://spam"},
        )

        assert res.status_code == 201
        assert leads.list_leads(shop.id) == []

    def test_a_loop_gets_cut_off(self, client, db):
        shop = _shop()
        body = {"name": "Ana", "phone": "59899123456"}
        url = f"/api/v1/public/{shop.subdomain}/leads"

        codes = [client.post(url, json=body).status_code for _ in range(7)]

        assert codes.count(201) == 5
        assert codes[-1] == 429


class TestTheCrmRoutes:
    def test_the_shop_reads_its_leads(self, client, db):
        shop = _plus_shop()
        leads.create_lead(shop.id, "Ana", phone="59899123456")

        res = client.get(f"/api/v1/tenants/{shop.id}/leads", headers=_auth(shop.id))

        assert res.status_code == 200
        assert [row["name"] for row in res.json()] == ["Ana"]

    def test_a_cheaper_tier_is_refused_by_the_api_too(self, client, db):
        # Hiding the screen is not enforcement.
        shop = _shop(plan="micro")

        res = client.get(f"/api/v1/tenants/{shop.id}/leads", headers=_auth(shop.id))

        assert res.status_code == 402

    def test_converting_twice_conflicts_instead_of_duplicating(self, client, db):
        shop = _plus_shop()
        lead = leads.create_lead(shop.id, "Ana", phone="59899123456")
        url = f"/api/v1/tenants/{shop.id}/leads/{lead.id}/convert"
        headers = _auth(shop.id)

        assert client.post(url, headers=headers).status_code == 201
        assert client.post(url, headers=headers).status_code == 409
        assert Lead.get_by_id(lead.id).status == "converted"

    def test_an_editor_can_delete_a_submission_in_its_tenant(self, client, db):
        shop = _plus_shop()
        lead = leads.create_lead(shop.id, "Ana", phone="59899123456")

        res = client.delete(
            f"/api/v1/tenants/{shop.id}/leads/{lead.id}", headers=_auth(shop.id)
        )

        assert res.status_code == 200
        assert res.json() == {"deleted": True}
        assert Lead.get_or_none(Lead.id == lead.id) is None

    def test_a_submission_cannot_be_deleted_from_another_tenant(self, client, db):
        shop = _plus_shop()
        other = _plus_shop()
        lead = leads.create_lead(other.id, "Ana", phone="59899123456")

        res = client.delete(
            f"/api/v1/tenants/{shop.id}/leads/{lead.id}", headers=_auth(shop.id)
        )

        assert res.status_code == 404
        assert Lead.get_or_none(Lead.id == lead.id) is not None
