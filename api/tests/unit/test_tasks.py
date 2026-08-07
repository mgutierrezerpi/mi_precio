"""Unit tests for Huey task bodies."""

from datetime import datetime, timedelta

import pytest

from models import AuthCode, Tenant, User
from tasks import notify_subscription_expired, run_billing_maintenance, send_invitation_email


@pytest.fixture
def captured_notices(monkeypatch):
    """Record who would be warned instead of enqueueing a real Huey task."""
    notified = []
    monkeypatch.setattr("tasks.notify_subscription_expired", notified.append)
    return notified


def test_run_billing_maintenance_expires_billing_and_prunes_auth_codes(db, captured_notices):
    tenant = Tenant.create(
        name="Shop",
        subdomain="shop",
        currency="UYU",
        plan="plus",
        billing_status="active",
        billing_ends_at=datetime.utcnow() - timedelta(minutes=1),
    )
    AuthCode.create(
        email="old@example.com",
        code="123456",
        expires_at=datetime.utcnow() - timedelta(minutes=1),
    )

    result = run_billing_maintenance.call_local()

    tenant = Tenant.get_by_id(tenant.id)
    assert result == {
        "expired_subscriptions": 1,
        "pruned_codes": 1,
        "pending_billing_checks": 0,
    }
    assert tenant.plan == "free"
    assert tenant.billing_status == "expired"
    assert AuthCode.select().count() == 0


def test_run_billing_maintenance_warns_every_tenant_it_expired(db, captured_notices):
    """Expiring takes the public page down — nobody should learn that from a customer."""
    expired = Tenant.create(
        name="Shop", subdomain="shop", currency="UYU", plan="plus",
        billing_status="active", billing_ends_at=datetime.utcnow() - timedelta(minutes=1),
    )
    Tenant.create(
        name="Still Paying", subdomain="still", currency="UYU", plan="plus",
        billing_status="active", billing_ends_at=datetime.utcnow() + timedelta(days=5),
    )

    run_billing_maintenance.call_local()

    assert captured_notices == [expired.id]


def test_notify_subscription_expired_mails_the_owner(db, monkeypatch):
    tenant = Tenant.create(name="Café Aurora", subdomain="aurora", currency="UYU", plan="free")
    User.create(tenant=tenant.id, email="duenio@aurora.com", role="owner")
    User.create(tenant=tenant.id, email="empleado@aurora.com", role="editor")

    sent = {}
    monkeypatch.setattr("tasks.settings.public_app_url", "https://app.example.com")
    monkeypatch.setattr("tasks.mailer.send", lambda **kwargs: sent.update(kwargs) or True)

    assert notify_subscription_expired.call_local(tenant.id) is True

    # The owner is warned, not the whole team.
    assert sent["to"] == "duenio@aurora.com"
    assert "Café Aurora" in sent["subject"]
    assert "https://app.example.com/planes" in sent["body"]
    # It must say the storefront is down and that nothing was lost.
    assert "no va a ver nada" in sent["body"]
    assert "intactos" in sent["body"]


def test_notify_subscription_expired_is_quiet_when_there_is_no_owner(db, monkeypatch):
    tenant = Tenant.create(name="Huérfana", subdomain="huerfana", currency="UYU", plan="free")
    monkeypatch.setattr("tasks.mailer.send", lambda **kwargs: pytest.fail("should not send"))

    assert notify_subscription_expired.call_local(tenant.id) is False


def test_send_invitation_email_uses_login_link(monkeypatch):
    sent = {}
    monkeypatch.setattr("tasks.settings.public_app_url", "https://app.example.com")
    monkeypatch.setattr(
        "tasks.mailer.send",
        lambda **kwargs: sent.update(kwargs) or True,
    )

    assert send_invitation_email.call_local("Editor@Shop.com", "editor", "Ferretería") is True

    assert sent["to"] == "Editor@Shop.com"
    assert sent["subject"] == "Invitación a Ferretería en Mi Precio"
    assert "https://app.example.com/login?email=Editor%40Shop.com" in sent["body"]
    assert "rol editor" in sent["body"]
