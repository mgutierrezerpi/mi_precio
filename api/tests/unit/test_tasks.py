"""Unit tests for Huey task bodies."""

from datetime import datetime, timedelta

from models import AuthCode, Tenant, User
from tasks import run_billing_maintenance, send_due_trial_notices, send_invitation_email


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
    assert result == {
        "expired_subscriptions": 1,
        "pruned_codes": 1,
        "pending_billing_checks": 0,
        "trial_ending_notices": 0,
        "trial_expired_notices": 0,
    }
    assert tenant.plan == "free"
    assert tenant.billing_status == "expired"
    assert AuthCode.select().count() == 0


def test_send_invitation_email_uses_login_link(monkeypatch, db):
    sent = {}
    monkeypatch.setattr("tasks.settings.public_app_url", "https://app.example.com")
    monkeypatch.setattr(
        "tasks.mailer.send",
        lambda **kwargs: sent.update(kwargs) or True,
    )

    assert (
        send_invitation_email.call_local(
            "Editor@Shop.com",
            "editor",
            "Ferretería",
            sentry_headers={"sentry-trace": "trace-id"},
        )
        is True
    )

    assert sent["to"] == "Editor@Shop.com"
    assert sent["subject"] == "Invitación a Ferretería en Mi Precio"
    assert "https://app.example.com/login?email=Editor%40Shop.com&code=" in sent["body"]
    assert AuthCode.get(AuthCode.email == "editor@shop.com").code in sent["body"]
    assert "rol editor" in sent["body"]


def test_trial_notices_are_sent_once(monkeypatch, db):
    now = datetime.utcnow()
    ending = Tenant.create(
        name="Ending",
        subdomain="ending",
        plan_gate=True,
        trial_started_at=now - timedelta(days=12),
        trial_ends_at=now + timedelta(days=2),
    )
    expired = Tenant.create(
        name="Expired",
        subdomain="expired",
        plan_gate=True,
        trial_started_at=now - timedelta(days=15),
        trial_ends_at=now - timedelta(days=1),
    )
    User.create(email="ending@example.com", tenant=ending, role="owner")
    User.create(email="expired@example.com", tenant=expired, role="owner")
    sent = []
    monkeypatch.setattr(
        "tasks.mailer.send", lambda **kwargs: sent.append(kwargs) or True
    )

    assert send_due_trial_notices(now) == {"ending": 1, "expired": 1}
    assert send_due_trial_notices(now) == {"ending": 0, "expired": 0}
    assert {message["to"] for message in sent} == {
        "ending@example.com",
        "expired@example.com",
    }
