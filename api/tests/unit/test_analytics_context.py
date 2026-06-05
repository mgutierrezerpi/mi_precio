"""Unit tests for the analytics context: QR vs link source tracking and visit stats."""

from datetime import datetime, timedelta

import pytest
from peewee import SqliteDatabase

from models import Tenant, PageView
from lib.ctx import analytics

analytics_db = SqliteDatabase(":memory:")


@pytest.fixture(scope="function")
def db():
    models = [Tenant, PageView]
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
    yesterday = datetime.utcnow() - timedelta(days=1)
    # 2 QR scans yesterday, 3 today -> +50%.
    PageView.create(tenant=tenant, source="qr", created_at=yesterday)
    PageView.create(tenant=tenant, source="qr", created_at=yesterday)
    for _ in range(3):
        analytics.record_view(tenant.id, source="qr")

    qr = analytics.visit_stats(tenant.id)["qr"]
    assert qr["today"] == 3
    assert qr["yesterday"] == 2
    assert qr["change_pct"] == 50
