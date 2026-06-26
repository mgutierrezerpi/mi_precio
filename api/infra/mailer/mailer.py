import logging
from typing import Any

from config import settings
from infra.mailer.error import MailerError

logger = logging.getLogger(__name__)

FROM_EMAIL = "codes@miprecio.app"


class Mailer:
    def __init__(self) -> None:
        self._client: Any | None = None

    def _get_client(self) -> Any:
        if self._client is None:
            if not settings.sendgrid_api_key:
                raise MailerError("SENDGRID_API_KEY is not configured")

            from sendgrid import SendGridAPIClient

            self._client = SendGridAPIClient(settings.sendgrid_api_key)

        return self._client

    def send(self, to: str, subject: str, body: str) -> bool:
        if not settings.mailer_enabled:
            logger.info(f"[MAILER] Email to {to}: {subject}\n{body}")
            return True

        from sendgrid.helpers.mail import Mail

        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to,
            subject=subject,
            plain_text_content=body,
        )

        try:
            client = self._get_client()
            response = client.send(message)
            if response.status_code >= 400:
                raise MailerError(f"SendGrid returned {response.status_code}")
            logger.info(
                "[MAILER] SendGrid accepted email to %s with status %s message_id=%s",
                to,
                response.status_code,
                response.headers.get("X-Message-Id", "unknown"),
            )
            return True
        except MailerError:
            raise
        except Exception as e:
            raise MailerError(f"Failed to send email: {e}") from e
