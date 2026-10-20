"""Deleting a business keeps the people who still belong to another one (R1)."""

from lib.ctx import identity
from models import Tenant, TenantMembership, User


def test_deleting_a_business_keeps_its_owner_if_they_run_another(db):
    cafe = identity.create_tenant("Café", "cafe-r1")
    kiosco = identity.create_tenant("Kiosco", "kiosco-r1")
    owner = User.create(email="dueno@cafe.com", tenant=cafe, role="owner")
    TenantMembership.create(user=owner, tenant=cafe, role="owner")
    TenantMembership.create(user=owner, tenant=kiosco, role="owner")

    assert identity.delete_tenant(cafe.id)

    survivor = User.get_or_none(User.id == owner.id)
    assert survivor is not None, "the owner of Kiosco was deleted with Café"
    assert survivor.tenant_id == kiosco.id
    assert survivor.role == "owner"
    assert TenantMembership.get_or_none(
        (TenantMembership.user == owner.id) & (TenantMembership.tenant == kiosco.id)
    )
    assert Tenant.get_or_none(Tenant.id == kiosco.id)


def test_people_who_only_belonged_to_it_go_with_it(db):
    cafe = identity.create_tenant("Café", "cafe-r1b")
    only_here = User.create(email="solo@cafe.com", tenant=cafe, role="editor")
    TenantMembership.create(user=only_here, tenant=cafe, role="editor")

    identity.delete_tenant(cafe.id)

    assert User.get_or_none(User.id == only_here.id) is None
