"""Sentry initialization shared by the API and background worker."""

import sentry_sdk

from config import settings

_initialized = False


def init_sentry() -> None:
    """Initialize Sentry once when a DSN is configured.

    SENTRY_DSN is intentionally supplied at runtime (as a Fly secret), so a
    checkout of the repository cannot accidentally send events to production.
    """
    global _initialized
    if _initialized:
        return
    _initialized = True

    if not settings.sentry_dsn:
        return

    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.sentry_environment,
        enable_logs=settings.sentry_enable_logs,
        send_default_pii=False,
    )
