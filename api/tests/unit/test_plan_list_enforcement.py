"""What a plan lets you keep *on air*, not just what it lets you create.

Limits used to be checked only when creating a list, so downgrading left every
list already published live forever. These cover the other half: the public page
serves no more lists than the current plan allows, and an expired subscription
takes the storefront offline entirely.
"""

from datetime import datetime, timedelta

from lib.ctx import identity, plans, public
from models import ListVersion, PriceList


def _tenant(plan="pro", **extra):
    tenant = identity.create_tenant("Test Store", "test_store")
    tenant.plan = plan
    for key, value in extra.items():
        setattr(tenant, key, value)
    tenant.save()
    return tenant


def _published_list(tenant, name, created_at):
    """A list that is published, with a published version, created at a set time."""
    price_list = PriceList.create(tenant=tenant.id, name=name, published=True)
    # created_at has a default, so set it after the fact to control the order.
    PriceList.update(created_at=created_at).where(PriceList.id == price_list.id).execute()
    ListVersion.create(list=price_list.id, name=name, published=True)
    return price_list


def _six_lists(tenant):
    base = datetime(2026, 1, 1)
    return [
        _published_list(tenant, f"Lista {n}", base + timedelta(days=n))
        for n in range(6)
    ]


def test_downgrade_takes_the_excess_lists_off_the_public_page(db):
    tenant = _tenant(plan="pro")
    _six_lists(tenant)
    assert len(public.get_published_lists(tenant)) == 6

    tenant.plan = "micro"  # 3 lists
    tenant.save()

    served = public.get_published_lists(tenant)
    assert [p.price_list.name for p in served] == ["Lista 0", "Lista 1", "Lista 2"]


def test_downgrade_keeps_the_oldest_lists(db):
    """The main catalogue is almost always the first list created."""
    tenant = _tenant(plan="pro")
    _six_lists(tenant)

    tenant.plan = "micro"
    tenant.save()

    names = [p.price_list.name for p in public.get_published_lists(tenant)]
    assert "Lista 0" in names
    assert "Lista 5" not in names


def test_downgrade_does_not_unpublish_anything(db):
    """Hiding is reversible: paying again must restore the storefront untouched."""
    tenant = _tenant(plan="pro")
    _six_lists(tenant)

    tenant.plan = "micro"
    tenant.save()
    public.get_published_lists(tenant)

    assert PriceList.select().where(PriceList.published).count() == 6

    tenant.plan = "pro"
    tenant.save()
    assert len(public.get_published_lists(tenant)) == 6


def test_expired_subscription_takes_every_list_offline(db):
    """"free" is not a tier to land on — an expired sub serves nothing at all."""
    tenant = _tenant(plan="pro")
    _six_lists(tenant)

    tenant.plan = "free"
    tenant.billing_status = "expired"
    tenant.save()

    assert public.get_published_lists(tenant) == []


def test_expired_subscription_requires_a_plan_even_without_the_gate_flag(db):
    """Accounts that predate `plan_gate` still get the plan screen once they lapse."""
    tenant = _tenant(plan="pro", plan_gate=False, billing_status="active")

    assert plans.plan_required(tenant.id) is False

    tenant.plan = "free"
    tenant.billing_status = "expired"
    tenant.save()

    assert plans.plan_required(tenant.id) is True


def test_old_account_that_never_subscribed_is_left_alone(db):
    """Grandfathered: no gate, no subscription, keeps its free allowance and CRM."""
    tenant = _tenant(plan="free", plan_gate=False)
    _six_lists(tenant)

    assert plans.plan_required(tenant.id) is False
    # Free allows one list — it is capped, not blacked out.
    assert len(public.get_published_lists(tenant)) == 1


def test_pro_plan_serves_every_published_list(db):
    tenant = _tenant(plan="pro")
    _six_lists(tenant)

    assert plans.live_list_allowance(tenant) is None
    assert len(public.get_published_lists(tenant)) == 6
