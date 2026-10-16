"""Tests for identified public-list viewers."""

from lib.ctx import customers, identity, lists, public_viewers, versions
from models import (
    Customer,
    CustomerListAccess,
    PriceList,
    PublicViewer,
    PublicViewerDismissal,
)


def _published_list(tenant_id: str):
    created = lists.create_list(tenant_id, "Retail")
    lists.update_list(
        created.price_list.id,
        published=True,
        capture_viewer_info=True,
    )
    versions.update_version(created.version.id, published=True)
    return created.price_list


def test_capture_viewer_requires_enabled_published_list(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    price_list = lists.create_list(tenant.id, "Retail").price_list

    assert (
        public_viewers.capture_viewer(
            tenant.id, price_list.id, "Lucía", email="lucia@example.com"
        )
        is None
    )
    assert PublicViewer.select().count() == 0


def test_capture_viewer_stores_cookie_token_and_ip(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    price_list = _published_list(tenant.id)

    viewer = public_viewers.capture_viewer(
        tenant.id,
        price_list.id,
        "Lucía Pérez",
        email="lucia@example.com",
        visitor_token="a" * 43,
        ip_address="2001:db8::1",
    )

    assert viewer is not None
    assert viewer.visitor_token == "a" * 43
    assert viewer.ip_address == "2001:db8::1"


def test_capture_viewer_upserts_by_email_and_lists_viewers(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    price_list = _published_list(tenant.id)

    first = public_viewers.capture_viewer(
        tenant.id,
        price_list.id,
        "Lucía Pérez",
        email=" LUCIA@example.com ",
    )
    second = public_viewers.capture_viewer(
        tenant.id,
        price_list.id,
        "Lucía P.",
        phone="+598 99 123 456",
        email="lucia@example.com",
    )

    assert first is not None
    assert second is not None
    assert first.id == second.id
    assert second.name == "Lucía P."
    assert second.email == "lucia@example.com"
    assert second.phone == "+59899123456"
    assert second.view_count == 2
    assert len(public_viewers.list_viewers(tenant.id)) == 1


def test_cookie_identifies_future_list_visits(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    first_list = _published_list(tenant.id)
    second_list = _published_list(tenant.id)
    token = "b" * 43

    first = public_viewers.capture_viewer(
        tenant.id,
        first_list.id,
        "Lucía",
        email="lucia@example.com",
        visitor_token=token,
    )
    assert public_viewers.has_viewer(tenant.id, token)
    assert public_viewers.touch_viewer(tenant.id, token, first_list.id, "192.0.2.1")
    assert public_viewers.touch_viewer(tenant.id, token, second_list.id, "192.0.2.1")

    second = PublicViewer.get_or_none(
        (PublicViewer.tenant == tenant.id) & (PublicViewer.price_list == second_list.id)
    )
    assert second is not None
    assert second.visitor_token == first.visitor_token
    assert second.email == first.email
    assert second.ip_address == "192.0.2.1"
    assert PublicViewer.get_by_id(first.id).view_count == 2


def test_delete_viewer_is_scoped_to_its_tenant(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    other = identity.create_tenant("Other Store", "other-store")
    price_list = _published_list(tenant.id)
    viewer = public_viewers.capture_viewer(
        tenant.id, price_list.id, "Lucía", email="lucia@example.com"
    )

    assert not public_viewers.delete_viewer(other.id, viewer.id)
    assert PublicViewer.get_or_none(PublicViewer.id == viewer.id) is not None
    assert public_viewers.delete_viewer(tenant.id, viewer.id)
    assert PublicViewer.get_or_none(PublicViewer.id == viewer.id) is None


def test_anonymous_dismissal_is_aggregated_without_creating_a_viewer(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    price_list = _published_list(tenant.id)

    assert public_viewers.record_anonymous_dismissal(tenant.id, price_list.id)
    assert public_viewers.record_anonymous_dismissal(tenant.id, price_list.id)

    assert PublicViewer.select().count() == 0
    record = PublicViewerDismissal.get()
    assert record.dismissal_count == 2
    assert public_viewers.anonymous_dismissal_count(tenant.id) == 2


def test_promote_viewer_creates_one_customer_and_is_idempotent(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    price_list = _published_list(tenant.id)
    viewer = public_viewers.capture_viewer(
        tenant.id, price_list.id, "Lucía Pérez", email="lucia@example.com"
    )

    customer = public_viewers.promote_viewer(tenant.id, viewer.id)
    repeated = public_viewers.promote_viewer(tenant.id, viewer.id)

    assert customer is not None
    assert repeated is not None
    assert repeated.id == customer.id
    assert Customer.select().where(Customer.tenant == tenant.id).count() == 1
    viewer = PublicViewer.get_by_id(viewer.id)
    assert viewer.customer_id == customer.id


def test_promote_viewer_reuses_matching_customer(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    price_list = _published_list(tenant.id)
    existing = Customer.create(
        tenant=tenant, name="Existing Name", email="lucia@example.com"
    )
    viewer = public_viewers.capture_viewer(
        tenant.id, price_list.id, "Lucía Pérez", email="LUCIA@example.com"
    )

    customer = public_viewers.promote_viewer(tenant.id, viewer.id)

    assert customer is not None
    assert customer.id == existing.id
    assert Customer.select().where(Customer.tenant == tenant.id).count() == 1


def test_customer_code_unlocks_each_private_list_granted_to_the_customer(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    customer = customers.create_customer(tenant.id, name="Acme", access_code="ACME2026")
    first = lists.create_list(tenant.id, "Acme retail")
    second = lists.create_list(tenant.id, "Acme wholesale")
    for created in (first, second):
        # Mark it private first: `created.price_list` is the instance from
        # creation time, so saving it after update_list writes back its stale
        # published=False and the list stops being served at all.
        created.price_list.is_private = True
        created.price_list.save()
        lists.update_list(created.price_list.id, published=True)
        versions.update_version(created.version.id, published=True)
        CustomerListAccess.create(customer=customer, price_list=created.price_list)

    viewer = public_viewers.unlock_list(
        tenant.id, first.price_list.id, "ACME2026", visitor_token=None
    )

    assert viewer is not None
    assert public_viewers.has_list_access(first.price_list, viewer.visitor_token)
    assert public_viewers.has_list_access(second.price_list, viewer.visitor_token)
    assert not public_viewers.has_list_access(second.price_list, None)
    assert (
        public_viewers.unlock_list(
            tenant.id, second.price_list.id, "wrong-code", visitor_token=None
        )
        is None
    )


def _private_list_for(tenant_id: str, customer):
    created = lists.create_list(tenant_id, "Wholesale")
    created.price_list.is_private = True
    created.price_list.save()
    lists.update_list(created.price_list.id, published=True)
    versions.update_version(created.version.id, published=True)
    CustomerListAccess.create(customer=customer, price_list=created.price_list)
    return PriceList.get_by_id(created.price_list.id)


def test_a_form_with_a_known_email_does_not_inherit_the_customers_access(db):
    # A viewer linked to a customer carries that customer's private-list
    # access through its browser token. Typing the same email on another
    # browser must not hand that access (or that record) over.
    tenant = identity.create_tenant("Test Store", "test-store")
    public = _published_list(tenant.id)
    customer = customers.create_customer(
        tenant.id, name="Lucía", email="lucia@example.com"
    )
    private = _private_list_for(tenant.id, customer)
    original_token = "c" * 43
    linked = public_viewers.capture_viewer(
        tenant.id,
        public.id,
        "Lucía",
        email="lucia@example.com",
        visitor_token=original_token,
    )
    linked.customer_id = customer.id
    linked.save()

    other_token = "d" * 43
    other = public_viewers.capture_viewer(
        tenant.id,
        public.id,
        "Otra persona",
        email="LUCIA@example.com",
        visitor_token=other_token,
    )

    assert other is not None
    assert other.id != linked.id
    assert other.customer_id is None
    assert not public_viewers.has_list_access(private, other_token)
    # The customer's own browser keeps working and its record is untouched.
    kept = PublicViewer.get_by_id(linked.id)
    assert kept.visitor_token == original_token
    assert kept.name == "Lucía"
    assert public_viewers.has_list_access(private, original_token)
