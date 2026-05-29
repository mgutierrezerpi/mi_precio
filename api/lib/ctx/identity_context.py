"""Identity context - interface for tenant and user operations."""

from models import Tenant, User
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

    for key, value in updates.items():
        if value is not None:
            setattr(tenant, key, value)
    tenant.save()
    return tenant


def find_tenant_by_subdomain(subdomain: str) -> Tenant | None:
    return Tenant.get_or_none(Tenant.subdomain == subdomain.lower())


def get_or_create_user(email: str) -> UserResult:
    user = User.get_or_none(User.email == email.lower())
    if user:
        return UserResult(user, False)

    name = email.split("@")[0].title()
    subdomain = email.split("@")[0].lower().replace(".", "-")[:63]

    base = subdomain
    counter = 1
    while Tenant.select().where(Tenant.subdomain == subdomain).exists():
        subdomain = f"{base}-{counter}"[:63]
        counter += 1

    tenant = Tenant.create(name=name, subdomain=subdomain)
    user = User.create(email=email, tenant=tenant)
    return UserResult(user, True)
