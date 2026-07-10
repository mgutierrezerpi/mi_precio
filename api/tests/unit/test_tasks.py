"""Unit tests for Huey task bodies."""

from datetime import datetime, timedelta

from models import AuthCode, Tenant
from tasks import run_billing_maintenance, send_invitation_email


def test_run_billing_maintenance_expires_billing_and_prunes_auth_codes(db):
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
    assert result == {"expired_subscriptions": 1, "pruned_codes": 1}
    assert tenant.plan == "free"
    assert tenant.billing_status == "expired"
    assert AuthCode.select().count() == 0


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
