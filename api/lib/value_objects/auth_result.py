from dataclasses import dataclass
from models import User, Tenant


@dataclass(frozen=True)
class AuthResult:
    token: str
    user: User
    tenant: Tenant
