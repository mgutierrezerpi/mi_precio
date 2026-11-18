"""A list's validity period: calendar days, applied on every public path."""

from datetime import UTC, date, datetime, timedelta

import pytest

from lib.ctx import linktrees, lists, public, public_viewers
from lib.ctx.list_schedule import calendar_day, shop_today
from models import Customer, CustomerListAccess, PriceList
from tests.conftest import subscribed_tenant
from views import PriceListView


def _shop(subdomain="promo-shop"):
    return subscribed_tenant("Promo Shop", subdomain)


def _variant(tenant, starts=None, ends=None, name="Promo"):
    parent = lists.create_list(tenant.id, "Catalog")
    lists.update_list(parent.price_list.id, published=True)
    variant = lists.create_list(
        tenant.id,
        name,
        parent_list_id=parent.price_list.id,
        variant_type="promotion",
        starts_at=starts,
        ends_at=ends,
    )
    lists.update_list(variant.price_list.id, published=True)
    return PriceList.get_by_id(variant.price_list.id)


def _days(tenant, offset):
    return datetime.combine(
        shop_today(tenant) + timedelta(days=offset), datetime.min.time()
    )


@pytest.mark.parametrize(
    ("start", "end", "served", "state"),
    [
        (0, 5, True, "current"),  # first day
        (-5, 0, True, "current"),  # last day, whole
        (0, 0, True, "current"),  # a one-day promotion
        (1, 5, False, "upcoming"),  # the day before it starts
        (-5, -1, False, "ended"),  # the day after it ends
    ],
)
def test_period_edges_on_the_direct_link_and_the_crm(db, start, end, served, state):
    tenant = _shop()
    variant = _variant(tenant, _days(tenant, start), _days(tenant, end))

    direct = public.get_published_lists(tenant, variant.slug)
    view = PriceListView.render(variant)

    assert bool(direct) is served
    assert (variant.id in public.live_list_ids(tenant)) is served
    assert view.live is served
    assert view.schedule_state == state
    assert PriceList.get_by_id(variant.id).published is True


def test_a_list_without_dates_is_always_served(db):
    tenant = _shop()
    variant = _variant(tenant)

    assert public.get_published_lists(tenant, variant.slug)
    assert PriceListView.render(variant).schedule_state == "current"


def test_the_index_leaves_out_a_root_list_outside_its_period(db):
    tenant = _shop()
    variant = _variant(tenant, _days(tenant, -9), _days(tenant, -1))
    lists.update_list(variant.id, parent_list_id=None)

    names = [item.price_list.name for item in public.get_published_lists(tenant)]

    assert names == ["Catalog"]


def test_an_ended_list_takes_no_plan_slot(db):
    tenant = _shop()
    tenant.plan = "free"
    tenant.save()
    ended = lists.create_list(tenant.id, "Old season").price_list
    PriceList.update(ends_at=_days(tenant, -1), published=True).where(
        PriceList.id == ended.id
    ).execute()
    current = lists.create_list(tenant.id, "Current").price_list
    lists.update_list(current.id, published=True)

    assert public.live_list_ids(tenant) == [current.id]


@pytest.mark.parametrize(
    ("stored", "picked"),
    [
        ("2026-09-30 00:00:00+00:00", date(2026, 9, 30)),
        ("2026-09-30T00:00:00Z", date(2026, 9, 30)),
        ("2026-09-30 21:30:00", date(2026, 9, 30)),
        (datetime(2026, 9, 30, 23, 59), date(2026, 9, 30)),
        (date(2026, 9, 30), date(2026, 9, 30)),
    ],
)
def test_the_day_picked_never_moves_with_the_timezone(stored, picked):
    assert calendar_day(stored) == picked


def test_today_is_the_calendar_day_where_the_shop_is():
    class Shop:
        timezone = "America/Montevideo"

    # 01:00 UTC on the 1st is still 22:00 on the 30th in Montevideo.
    assert shop_today(Shop, datetime(2026, 10, 1, 1, tzinfo=UTC)) == date(2026, 9, 30)


def test_an_unknown_timezone_falls_back_instead_of_failing():
    class Shop:
        timezone = "Mars/Olympus"

    assert shop_today(Shop, datetime(2026, 10, 1, 12, tzinfo=UTC)) == date(2026, 10, 1)


def test_the_api_returns_the_same_day_it_was_given(client):
    tenant = _shop()
    parent = lists.create_list(tenant.id, "Catalog")
    variant = lists.create_list(
        tenant.id,
        "Promo",
        parent_list_id=parent.price_list.id,
        starts_at=datetime.fromisoformat("2026-09-01T00:00:00+00:00"),
        ends_at=datetime.fromisoformat("2026-09-30T00:00:00+00:00"),
    )

    view = PriceListView.render(variant.price_list).model_dump(mode="json")

    assert view["starts_at"] == "2026-09-01"
    assert view["ends_at"] == "2026-09-30"


def test_an_end_before_the_start_is_still_rejected(db):
    tenant = _shop()
    parent = lists.create_list(tenant.id, "Catalog")

    assert (
        lists.create_list(
            tenant.id,
            "Backwards",
            parent_list_id=parent.price_list.id,
            starts_at=_days(tenant, 2),
            ends_at=_days(tenant, 1),
        )
        is None
    )


def test_a_direct_link_to_an_ended_list_offers_the_rest_of_the_shop(client):
    tenant = _shop()
    variant = _variant(tenant, _days(tenant, -9), _days(tenant, -1))

    response = client.get(f"/api/v1/public/promo-shop?list={variant.slug}")

    assert response.status_code == 200
    body = response.json()
    assert body["tenant"]["name"] == "Promo Shop"
    assert [item["name"] for item in body["lists"]] == ["Catalog"]


def test_a_shop_with_only_lists_off_schedule_keeps_its_own_page(client):
    tenant = _shop()
    variant = _variant(tenant, _days(tenant, -9), _days(tenant, -1))
    lists.update_list(variant.id, parent_list_id=None)
    PriceList.update(published=False).where(PriceList.name == "Catalog").execute()

    response = client.get("/api/v1/public/promo-shop")

    assert response.status_code == 200
    assert response.json()["lists"] == []


def test_an_ended_private_list_does_not_ask_for_its_code(client):
    tenant = _shop()
    variant = _variant(tenant, _days(tenant, -9), _days(tenant, -1))
    lists.update_list(variant.id, is_private=True)

    response = client.get(f"/api/v1/public/promo-shop?list={variant.slug}")

    assert response.status_code == 200


def test_an_ended_private_list_cannot_be_unlocked(db):
    tenant = _shop()
    variant = _variant(tenant, _days(tenant, -9), _days(tenant, -1))
    lists.update_list(variant.id, is_private=True)
    customer = Customer.create(tenant=tenant, name="Acme")
    CustomerListAccess.create(customer=customer, price_list=variant)

    assert (
        public_viewers.unlock_list(str(tenant.id), variant.slug, "1234", None) is None
    )


def test_an_ended_list_does_not_capture_viewers(db):
    tenant = _shop()
    variant = _variant(tenant, _days(tenant, -9), _days(tenant, -1))
    lists.update_list(variant.id, capture_viewer_info=True)

    captured = public_viewers.capture_viewer(
        str(tenant.id), variant.id, "Ana", email="ana@example.com"
    )

    assert captured is None
    assert (
        public_viewers.record_anonymous_dismissal(str(tenant.id), variant.id) is False
    )


def test_the_linktree_hides_links_to_lists_off_schedule(client):
    tenant = _shop()
    ended = _variant(tenant, _days(tenant, -9), _days(tenant, -1), "Ended")
    running = _variant(tenant, _days(tenant, -1), _days(tenant, 1), "Running")
    tree = linktrees.get_linktree(str(tenant.id))
    linktrees.update_linktree(
        tree.id,
        published=True,
        links=[
            {"id": "a", "title": "Ended", "url": f"/p/promo-shop/{ended.slug}"},
            {
                "id": "b",
                "title": "Ended, full address",
                "url": f"https://miprecio.app/p/promo-shop/{ended.slug}/",
            },
            {"id": "c", "title": "Running", "url": f"/p/promo-shop/{running.slug}"},
            {"id": "d", "title": "Catalog", "url": "/p/promo-shop"},
        ],
    )

    response = client.get(f"/api/v1/public/{tree.public_slug}/linktree")

    titles = [link["title"] for link in response.json()["linktree"]["links"]]
    assert titles == ["Running", "Catalog"]
