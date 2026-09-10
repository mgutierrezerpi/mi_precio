"""Unit tests for Huey task bodies."""

from datetime import datetime, timedelta

from models import AuthCode, Lead, Tenant, TenantMembership, User
from tasks import (
    run_billing_maintenance,
    send_contact_submission_email,
    send_invitation_email,
)


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


def test_send_contact_submission_email_notifies_owners_and_admins(monkeypatch, db):
    tenant = Tenant.create(name="Tienda", subdomain="tienda")
    owner = User.create(email="owner@example.com", tenant=tenant, name="Owner")
    admin = User.create(email="admin@example.com", tenant=tenant, name="Admin")
    editor = User.create(email="editor@example.com", tenant=tenant, name="Editor")
    TenantMembership.create(user=owner, tenant=tenant, role="owner")
    TenantMembership.create(user=admin, tenant=tenant, role="admin")
    TenantMembership.create(user=editor, tenant=tenant, role="editor")
    lead = Lead.create(
        tenant=tenant,
        name="María Pérez",
        email="maria@example.com",
        phone="099123456",
        message="Quiero saber más.",
        source="contact",
    )
    sent: list[dict[str, str]] = []
    monkeypatch.setattr("tasks.mailer.send", lambda **kwargs: sent.append(kwargs) or True)

    assert send_contact_submission_email.call_local(lead.id) == 2
    assert {email["to"] for email in sent} == {"owner@example.com", "admin@example.com"}
    assert {email["subject"] for email in sent} == {"Nuevo contacto para Tienda"}
    assert all("María Pérez" in email["body"] for email in sent)
    assert all("maria@example.com" in email["body"] for email in sent)
