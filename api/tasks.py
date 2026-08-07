"""Huey tasks for asynchronous and periodic work.

The consumer runs in the same Fly Machine as the API so SQLite writes happen on
the LiteFS primary mount. Keep task bodies idempotent: Huey can retry failed
tasks, and periodic jobs may rerun after restarts.
"""

import logging
import os
from pathlib import Path
from urllib.parse import urlencode

from huey import SqliteHuey, crontab

from config import settings
from infra.mailer import mailer
from lib.ctx import auth, billing_context as billing
from models import db

logger = logging.getLogger(__name__)

HUEY_DB_PATH = os.environ.get("HUEY_DB_PATH", "huey.db")
_huey_db_parent = Path(HUEY_DB_PATH).parent
if str(_huey_db_parent) not in ("", "."):
    _huey_db_parent.mkdir(parents=True, exist_ok=True)

huey = SqliteHuey(
    "mi_precio",
    filename=HUEY_DB_PATH,
)


def _with_db(task):
    db.connect(reuse_if_open=True)
    try:
        return task()
    finally:
        if not db.is_closed():
            db.close()


@huey.task(retries=2, retry_delay=30)
def run_billing_maintenance() -> dict[str, int]:
    """Resume due billing lookups, expire subscriptions, and prune auth codes."""

    expired_subscriptions = _with_db(billing.expire_ended_subscriptions)
    pruned_codes = _with_db(auth.prune_expired_codes)
    pending_ids = _with_db(billing.due_pending_subscription_ids)
    for tenant_id in pending_ids:
        check_pending_billing.schedule((tenant_id,), delay=0)

    if expired_subscriptions:
        logger.info("Expired %s ended billing subscriptions", expired_subscriptions)
    if pruned_codes:
        logger.info("Pruned %s expired auth codes", pruned_codes)

    return {
        "expired_subscriptions": expired_subscriptions,
        "pruned_codes": pruned_codes,
        "pending_billing_checks": len(pending_ids),
    }


@huey.task(retries=2, retry_delay=30)
def check_pending_billing(tenant_id: str) -> dict[str, object]:
    """Poll a checkout with exponential backoff until its webhook arrives."""

    try:
        return _with_db(lambda: billing.poll_pending_subscription(tenant_id))
    except billing.BillingError:
        logger.warning(
            "Billing lookup failed for tenant %s; deferring with backoff", tenant_id
        )
        return _with_db(lambda: billing.defer_pending_subscription(tenant_id))


@huey.task(retries=2, retry_delay=30)
def send_invitation_email(email: str, role: str, tenant_name: str) -> bool:
    """Send the invitation with a one-time login link."""

    code = _with_db(lambda: auth.create_code(email))
    invite_url = f"{settings.public_app_url.rstrip('/')}/login?{urlencode({'email': email, 'code': code})}"
    body = (
        f"Te invitaron a unirte a {tenant_name} en Mi Precio con rol {role}.\n\n"
        "Para aceptar la invitación, abrí este enlace para iniciar sesión automáticamente:\n"
        f"{invite_url}\n\n"
        "El enlace es de un solo uso y vence en 10 minutos."
    )
    mailer.send(
        to=email,
        subject=f"Invitación a {tenant_name} en Mi Precio",
        body=body,
    )
    return True


@huey.periodic_task(crontab(minute="*/5"), retries=2, retry_delay=30)
def run_periodic_maintenance() -> dict[str, int]:
    """Run maintenance every five minutes."""

    return run_billing_maintenance.call_local()
