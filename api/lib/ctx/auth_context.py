"""Auth context - authentication business logic."""

from datetime import datetime, timedelta
from models import AuthCode
from lib.ctx.identity_context import get_or_create_user
from lib import generate_verification_code, encode_token
from lib.value_objects import AuthResult


def send_code(email: str) -> str:
    """Generate and store a verification code for the email."""
    email = email.lower()
    AuthCode.delete().where(AuthCode.email == email).execute()
    code = generate_verification_code()
    AuthCode.create(
        email=email,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    print(f"[AUTH] Code for {email}: {code}")
    return code


def verify_code(email: str, code: str) -> bool:
    """Verify and consume an auth code."""
    auth_code = AuthCode.get_or_none(
        (AuthCode.email == email.lower())
        & (AuthCode.code == code)
        & ~AuthCode.used
        & (AuthCode.expires_at > datetime.utcnow())
    )
    if auth_code:
        auth_code.used = True
        auth_code.save()
    return bool(auth_code)


def authenticate(email: str, code: str) -> AuthResult | None:
    """Verify code and return auth token with user info."""
    if not verify_code(email, code):
        return None

    result = get_or_create_user(email)
    user = result.user
    tenant = user.tenant
    token = encode_token(str(user.id), user.email, tenant.id)

    return AuthResult(token, user, tenant)
