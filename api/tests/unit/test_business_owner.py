"""Finding a business's owner through memberships, and repairing legacy roles."""

from lib.ctx import billing_common, identity
from models import TenantMembership, User
from models.schema_maintenance import sync_legacy_roles


def test_the_owner_of_a_second_business_is_found(db):
    first = identity.create_tenant("Primera", "primera")
    second = identity.create_tenant("Segunda", "segunda")
    user = User.create(email="duena@test.com", tenant=first, role="owner")
    TenantMembership.create(user=user, tenant=first, role="owner")
    TenantMembership.create(user=user, tenant=second, role="owner")

    assert billing_common.owner_of(second.id).id == user.id
    assert billing_common.expiry_notice_target(second.id) == (
        "duena@test.com",
        "Segunda",
    )


def test_an_owner_with_an_overwritten_legacy_role_is_still_found(db):
    shop = identity.create_tenant("Tienda", "tienda")
    user = User.create(email="duena@test.com", tenant=shop, role="viewer")
    TenantMembership.create(user=user, tenant=shop, role="owner")

    assert billing_common.owner_of(shop.id).id == user.id


def test_sync_legacy_roles_realigns_the_primary_business_role(db):
    shop = identity.create_tenant("Tienda", "tienda")
    other = identity.create_tenant("Otra", "otra")
    user = User.create(email="duena@test.com", tenant=shop, role="viewer")
    TenantMembership.create(user=user, tenant=shop, role="owner")
    TenantMembership.create(user=user, tenant=other, role="viewer")

    sync_legacy_roles()

    assert User.get_by_id(user.id).role == "owner"
