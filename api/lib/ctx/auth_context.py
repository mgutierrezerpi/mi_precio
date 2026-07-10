"""Auth context - authentication business logic."""

import logging

from datetime import datetime, timedelta
from config import settings
from infra.mailer import MailerError, mailer
from models import AuthCode
from lib.ctx.identity_context import get_or_create_user
from lib import generate_verification_code, encode_token
from lib.value_objects import AuthResult

logger = logging.getLogger(__name__)


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

    if settings.debug:
        logger.warning(f"[AUTH] Local login code for {email}: {code}")
        return code

    try:
        mailer.send(
            to=email,
            subject="Your Mi Precio verification code",
            body=f"Your verification code is: {code}\n\nThis code expires in 10 minutes.",
        )
    except MailerError as e:
        raise RuntimeError(f"Failed to send code to {email}") from e

    if settings.log_auth_codes:
        logger.info(f"[AUTH] Code for {email}: {code}")

    return code


def prune_expired_codes(now: datetime | None = None) -> int:
    """Delete expired auth codes. Used by the in-machine maintenance worker."""
    cutoff = now or datetime.utcnow()
    return AuthCode.delete().where(AuthCode.expires_at <= cutoff).execute()


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

    # Track sign-in so the team screen can show who's active.
    user.last_seen_at = datetime.utcnow()
    user.save()

    token = encode_token(str(user.id), user.email, tenant.id, user.role)

    return AuthResult(token, user, tenant)
