"""Unit tests for the analytics context: QR vs link source tracking and visit stats."""

from datetime import UTC, datetime, timedelta
from zoneinfo import ZoneInfo

import pytest
from peewee import SqliteDatabase

from lib.ctx import analytics
from models import Customer, Order, OrderItem, PageView, PriceList, Tenant

analytics_db = SqliteDatabase(":memory:")


@pytest.fixture(scope="function")
def db():
    models = [Tenant, Customer, PriceList, PageView, Order, OrderItem]
    analytics_db.bind(models)
    analytics_db.connect()
    analytics_db.create_tables(models)
    yield analytics_db
    analytics_db.drop_tables(models)
    analytics_db.close()


@pytest.fixture
def tenant(db):
    return Tenant.create(name="Lavadero", subdomain="lavadero", currency="UYU")


def test_record_view_defaults_to_link(tenant):
    analytics.record_view(tenant.id)
    pv = PageView.get()
    assert pv.source == "link"


def test_record_view_tags_qr_source(tenant):
    analytics.record_view(tenant.id, list_id="abc", source="qr")
    pv = PageView.get()
    assert pv.source == "qr"
    assert pv.list_id == "abc"


def test_record_view_normalizes_unknown_source(tenant):
    analytics.record_view(tenant.id, source="bogus")
    assert PageView.get().source == "link"


def test_record_view_ignores_unknown_tenant(db):
    analytics.record_view("does-not-exist", source="qr")
    # No row should be created for a tenant that doesn't exist.
    assert PageView.select().count() == 0


def test_visit_stats_splits_qr_from_overall(tenant):
    analytics.record_view(tenant.id, source="qr")
    analytics.record_view(tenant.id, source="qr")
    analytics.record_view(tenant.id, source="link")

    stats = analytics.visit_stats(tenant.id)
    assert stats["total"] == 3
    assert stats["today"] == 3
    assert stats["qr"]["total"] == 2
    assert stats["qr"]["today"] == 2


def test_visit_stats_change_pct_uses_yesterday(tenant):
    yesterday = datetime.now(UTC).replace(tzinfo=None) - timedelta(days=1)
    # 2 QR scans yesterday, 3 today -> +50%.
    PageView.create(tenant=tenant, source="qr", created_at=yesterday)
    PageView.create(tenant=tenant, source="qr", created_at=yesterday)
    for _ in range(3):
        analytics.record_view(tenant.id, source="qr")

    qr = analytics.visit_stats(tenant.id)["qr"]
    assert qr["today"] == 3
    assert qr["yesterday"] == 2
    assert qr["change_pct"] == 50


def test_reports_scopes_traffic_to_the_selected_list(tenant):
    first = PriceList.create(tenant=tenant, name="Minorista")
    second = PriceList.create(tenant=tenant, name="Mayorista")
    analytics.record_view(tenant.id, list_id=first.id, source="link")
    analytics.record_view(tenant.id, list_id=first.id, source="qr")
    analytics.record_view(tenant.id, list_id=second.id, source="qr")

    report = analytics.reports(tenant.id, list_id=first.id)

    assert report["list_id"] == first.id
    assert report["kpis"]["visits"] == 2
    assert report["kpis"]["qr_scans"] == 1
    assert report["channels"] == {"link": 1, "qr": 1}


def test_reports_ignores_a_list_from_another_tenant(tenant):
    other = Tenant.create(name="Otro", subdomain="otro", currency="UYU")
    foreign_list = PriceList.create(tenant=other, name="Privada")
    analytics.record_view(tenant.id, source="link")

    report = analytics.reports(tenant.id, list_id=foreign_list.id)

    assert report["list_id"] is None
    assert report["kpis"]["visits"] == 1


def test_reports_clamps_the_requested_window_and_preserves_empty_days(tenant):
    report = analytics.reports(tenant.id, days=0)

    assert report["days"] == 1
    assert len(report["series"]) == 1
    assert report["series"][0]["link"] == 0
    assert report["series"][0]["qr"] == 0


def test_daily_series_uses_the_tenants_timezone_for_date_buckets(tenant):
    tenant.timezone = "America/Montevideo"
    tenant.save()
    # 01:30 UTC is still the previous calendar day in Montevideo (UTC-3).
    PageView.create(
        tenant=tenant,
        source="link",
        created_at=datetime(2026, 1, 2, 1, 30),
    )
    window_start = datetime(2026, 1, 1, 3, 0)  # Jan 1 local midnight in UTC.

    series, _ = analytics._view_series(
        [PageView.tenant == tenant.id, PageView.created_at >= window_start],
        window_start,
        2,
        ZoneInfo(tenant.timezone),
    )

    assert series == [
        {"date": "2026-01-01", "link": 1, "qr": 0},
        {"date": "2026-01-02", "link": 0, "qr": 0},
    ]
