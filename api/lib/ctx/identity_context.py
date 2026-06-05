"""Identity context - interface for tenant and user operations."""

from datetime import datetime

from models import Tenant, User, Invitation
from lib.value_objects import UserResult


def list_tenants() -> list[Tenant]:
    return list(Tenant.select())


def get_tenant(tenant_id: str) -> Tenant | None:
    return Tenant.get_or_none(Tenant.id == tenant_id)


def create_tenant(name: str, subdomain: str) -> Tenant | None:
    subdomain = subdomain.lower()
    if Tenant.select().where(Tenant.subdomain == subdomain).exists():
        return None
    return Tenant.create(name=name, subdomain=subdomain)


def update_tenant(tenant_id: str, **updates) -> Tenant | None:
    tenant = get_tenant(tenant_id)
    if not tenant:
        return None

    # Check subdomain uniqueness if being updated
    new_subdomain = updates.get("subdomain")
    if new_subdomain and new_subdomain != tenant.subdomain:
        existing = Tenant.select().where(
            (Tenant.subdomain == new_subdomain) & (Tenant.id != tenant_id)
        ).exists()
        if existing:
            raise ValueError("Subdomain already in use")

    # These have NOT NULL / defaults — never blank them out. Other (nullable)
    # fields may be set to None to clear them (e.g. removing a logo).
    protected = {"name", "subdomain", "currency", "language", "timezone"}
    for key, value in updates.items():
        if value is None and key in protected:
            continue
        setattr(tenant, key, value)
    tenant.save()
    return tenant


def find_tenant_by_subdomain(subdomain: str) -> Tenant | None:
    return Tenant.get_or_none(Tenant.subdomain == subdomain.lower())


def touch_last_seen(user_id: str, min_interval_seconds: int = 60) -> None:
    """Mark a user as recently active (presence heartbeat), throttled so we don't
    write on every request. Called from polled endpoints while the app is open."""
    user = User.get_or_none(User.id == user_id)
    if not user:
        return
    now = datetime.utcnow()
    if user.last_seen_at is None or (now - user.last_seen_at).total_seconds() >= min_interval_seconds:
        user.last_seen_at = now
        user.save()


def delete_tenant(tenant_id: str) -> bool:
    """Permanently delete a tenant and everything under it (users, lists, products,
    customers, orders, page views, etc.) via cascading FK deletes."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return False
    tenant.delete_instance(recursive=True)
    return True


def get_or_create_user(email: str) -> UserResult:
    email = email.lower()
    user = User.get_or_none(User.email == email)
    if user:
        return UserResult(user, False)

    # If someone invited this email, join their team instead of creating a new tenant.
    invite = Invitation.get_or_none(
        (Invitation.email == email) & (Invitation.status == "pending")
    )
    if invite:
        user = User.create(
            email=email,
            tenant=invite.tenant,
            name=email.split("@")[0].title(),
            role=invite.role,
        )
        invite.status = "accepted"
        invite.save()
        return UserResult(user, True)

    name = email.split("@")[0].title()
    subdomain = email.split("@")[0].lower().replace(".", "-")[:63]

    base = subdomain
    counter = 1
    while Tenant.select().where(Tenant.subdomain == subdomain).exists():
        subdomain = f"{base}-{counter}"[:63]
        counter += 1

    tenant = Tenant.create(name=name, subdomain=subdomain)
    # First user of a brand-new tenant owns it.
    user = User.create(email=email, tenant=tenant, name=name, role="owner")
    return UserResult(user, True)
