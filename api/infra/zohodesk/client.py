import logging
import time
from typing import Any

import httpx

from config import settings
from infra.zohodesk.error import ZohoDeskError

logger = logging.getLogger(__name__)

# Zoho Desk expects capitalized priority labels on the Tickets API.
PRIORITY = {"low": "Low", "medium": "Medium", "high": "High", "urgent": "Urgent"}


class ZohoDeskClient:
    """Zoho Desk Tickets API client (OAuth2).

    Zoho access tokens live ~1h and are minted from a long-lived refresh token,
    so we cache the access token and the default department id in memory. The
    client secret + refresh token never reach the browser.
    """

    def __init__(self) -> None:
        self._access_token: str | None = None
        self._token_expiry: float = 0.0
        self._department_id: str | None = None

    def _get_access_token(self) -> str:
        # Reuse the cached token until a minute before it expires.
        if self._access_token and time.time() < self._token_expiry - 60:
            return self._access_token

        resp = httpx.post(
            f"{settings.zohodesk_accounts_base}/oauth/v2/token",
            params={
                "refresh_token": settings.zohodesk_refresh_token,
                "client_id": settings.zohodesk_client_id,
                "client_secret": settings.zohodesk_client_secret,
                "grant_type": "refresh_token",
            },
            timeout=10.0,
        )
        if resp.status_code >= 400:
            raise ZohoDeskError(f"Zoho token refresh failed ({resp.status_code}): {resp.text}")

        data = resp.json()
        token = data.get("access_token")
        if not token:
            raise ZohoDeskError(f"Zoho token response missing access_token: {data}")

        self._access_token = token
        self._token_expiry = time.time() + int(data.get("expires_in", 3600))
        return token

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Zoho-oauthtoken {self._get_access_token()}",
            "orgId": settings.zohodesk_org_id,
            "Content-Type": "application/json",
        }

    def _get_department_id(self) -> str:
        # A Zoho Desk ticket must be filed under a department. Use the configured
        # one, else auto-detect the default department once and cache it.
        if settings.zohodesk_department_id:
            return settings.zohodesk_department_id
        if self._department_id:
            return self._department_id

        resp = httpx.get(
            f"{settings.zohodesk_api_base}/api/v1/departments",
            params={"isEnabled": "true"},
            headers=self._headers(),
            timeout=10.0,
        )
        if resp.status_code >= 400:
            raise ZohoDeskError(f"Zoho departments fetch failed ({resp.status_code}): {resp.text}")

        depts = resp.json().get("data", [])
        if not depts:
            raise ZohoDeskError("Zoho Desk has no department to file the ticket under")

        default = next((d for d in depts if d.get("isDefault")), depts[0])
        self._department_id = str(default["id"])
        return self._department_id

    def create_ticket(
        self,
        *,
        email: str,
        subject: str,
        description: str,
        priority: str = "medium",
        name: str | None = None,
    ) -> dict[str, Any]:
        if not settings.zohodesk_enabled:
            # Not configured: log the ticket so nothing is lost while credentials
            # are pending, and surface a typed error the controller maps to 503.
            logger.info(
                "[ZOHODESK] (disabled) ticket from %s <%s>: %s\n%s",
                name or "-",
                email,
                subject,
                description,
            )
            raise ZohoDeskError("Zoho Desk is not configured")

        payload: dict[str, Any] = {
            "subject": subject,
            "description": description,
            "departmentId": self._get_department_id(),
            "priority": PRIORITY.get(priority, "Medium"),
            "status": "Open",
            # Zoho links to an existing contact by email, or creates one; lastName
            # is required, so fall back to the email when we have no name.
            "contact": {"lastName": name or email, "email": email},
        }

        try:
            resp = httpx.post(
                f"{settings.zohodesk_api_base}/api/v1/tickets",
                json=payload,
                headers=self._headers(),
                timeout=10.0,
            )
        except httpx.HTTPError as exc:
            raise ZohoDeskError(f"Zoho Desk request failed: {exc}") from exc

        if resp.status_code >= 400:
            raise ZohoDeskError(f"Zoho Desk returned {resp.status_code}: {resp.text}")

        data = resp.json()
        logger.info(
            "[ZOHODESK] Created ticket #%s (%s) for %s",
            data.get("ticketNumber"),
            data.get("id"),
            email,
        )
        return data


client = ZohoDeskClient()
