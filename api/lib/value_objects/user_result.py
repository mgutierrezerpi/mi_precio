from dataclasses import dataclass
from models import User


@dataclass(frozen=True)
class UserResult:
    user: User
    created: bool
