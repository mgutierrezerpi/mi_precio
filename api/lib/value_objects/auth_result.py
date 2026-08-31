from dataclasses import dataclass

from models import Tenant, User


@dataclass(frozen=True)
class AuthResult:
    token: str
    user: User
    tenant: Tenant
    role: str | None = None
