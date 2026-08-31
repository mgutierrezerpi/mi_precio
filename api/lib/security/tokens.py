"""JWT token utilities."""

from datetime import UTC, datetime, timedelta

import jwt

from config import settings


def encode_token(
    user_id: str,
    email: str,
    tenant_id: str,
    role: str = "owner",
    is_super_admin: bool = False,
) -> str:
    """Create a JWT token for the given user."""
    payload = {
        "sub": user_id,
        "email": email,
        "tenant_id": tenant_id,
        "role": role,
        "is_super_admin": is_super_admin,
        "exp": datetime.now(UTC) + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict | None:
    """Decode a JWT token. Returns None if invalid or expired."""
    try:
        return jwt.decode(
            token, settings.secret_key, algorithms=[settings.jwt_algorithm]
        )
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
