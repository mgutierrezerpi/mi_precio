"""Price-list variant behavior."""

from lib.ctx import identity, items, lists, public, versions
from models import Customer


def test_variant_clones_parent_items_and_keeps_its_own_version(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    parent = lists.create_list(tenant.id, "Retail")
    items.create_item(parent.version.id, name="Coffee", price=120)

    variant = lists.create_list(
        tenant.id,
        "Retail — summer sale",
        parent_list_id=parent.price_list.id,
        variant_type="seasonal",
    )

    assert variant is not None
    assert variant.price_list.parent_list_id == parent.price_list.id
    assert variant.price_list.variant_type == "seasonal"
    copied_items = list(variant.version.items)
    assert len(copied_items) == 1
    assert copied_items[0].name == "Coffee"
    assert copied_items[0].price == 120

    items.update_item(copied_items[0].id, price=99)
    assert list(parent.version.items)[0].price == 120


def test_customer_variant_is_bound_to_a_customer_in_the_same_tenant(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    parent = lists.create_list(tenant.id, "Retail")
    customer = Customer.create(tenant=tenant, name="Acme")

    variant = lists.create_list(
        tenant.id,
        "Acme prices",
        parent_list_id=parent.price_list.id,
        variant_type="customer",
        customer_id=customer.id,
    )

    assert variant is not None
    assert variant.price_list.customer_id == customer.id


def test_variant_requires_a_root_list_from_the_same_tenant(db):
    first = identity.create_tenant("First", "first")
    second = identity.create_tenant("Second", "second")
    parent = lists.create_list(first.id, "Retail")

    assert (
        lists.create_list(
            second.id,
            "Private prices",
            parent_list_id=parent.price_list.id,
            variant_type="customer",
        )
        is None
    )


def test_variants_are_hidden_from_the_public_catalog_index(db):
    tenant = identity.create_tenant("Test Store", "test-store")
    parent = lists.create_list(tenant.id, "Retail")
    variant = lists.create_list(
        tenant.id,
        "Retail — promotion",
        parent_list_id=parent.price_list.id,
        variant_type="promotion",
    )
    lists.update_list(parent.price_list.id, published=True)
    versions.update_version(parent.version.id, published=True)
    lists.update_list(variant.price_list.id, published=True)
    versions.update_version(variant.version.id, published=True)

    visible = public.get_published_lists(tenant)

    assert [entry.price_list.id for entry in visible] == [parent.price_list.id]

    direct_variant = public.get_published_lists(tenant, variant.price_list.slug)

    assert [entry.price_list.id for entry in direct_variant] == [variant.price_list.id]
