"""Capture and list contacts who identify themselves on public lists."""

import ipaddress
import re
import secrets

from lib.ctx.public_viewer_management import (
    anonymous_dismissal_count,  # noqa: F401
    list_viewers,  # noqa: F401
    record_anonymous_dismissal,  # noqa: F401
)
from lib.ctx.public_viewer_promotion import promote_viewer  # noqa: F401
from lib.ctx.public_viewer_touch import touch_viewer  # noqa: F401
from models import (
    PriceList,
    PublicViewer,
    Tenant,
)
from models.base import utc_now

PUBLIC_VIEWER_COOKIE = "miprecio_viewer"
PUBLIC_VIEWER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365


def capture_viewer(
    tenant_id: str,
    list_id: str,
    name: str,
    email: str | None = None,
    phone: str | None = None,
    visitor_token: str | None = None,
    ip_address: str | None = None,
) -> PublicViewer | None:
    """Upsert one viewer and retain an opt-in browser identifier for future visits."""
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    price_list = PriceList.get_or_none(
        (PriceList.id == list_id) & (PriceList.tenant == tenant_id)
    )
    if not tenant or not price_list or not price_list.published:
        return None
    if not price_list.capture_viewer_info:
        return None

    normalized_email = email.strip().lower() if email else None
    normalized_phone = _normalize_phone(phone) if phone else None
    if not normalized_email and not normalized_phone:
        return None

    token = _normalize_token(visitor_token) or secrets.token_urlsafe(32)
    normalized_ip = _normalize_ip(ip_address)
    identity = PublicViewer.get_or_none(
        (PublicViewer.tenant == tenant_id)
        & (PublicViewer.price_list == price_list.id)
        & (PublicViewer.visitor_token == token)
    )
    if not identity and normalized_email:
        identity = PublicViewer.get_or_none(
            (PublicViewer.tenant == tenant_id)
            & (PublicViewer.price_list == price_list.id)
            & (PublicViewer.email == normalized_email)
        )
    if not identity and normalized_phone:
        identity = PublicViewer.get_or_none(
            (PublicViewer.tenant == tenant_id)
            & (PublicViewer.price_list == price_list.id)
            & (PublicViewer.phone == normalized_phone)
        )

    now = utc_now()
    if identity:
        identity.name = name.strip()
        identity.email = normalized_email or identity.email
        identity.phone = normalized_phone or identity.phone
        identity.visitor_token = token
        identity.ip_address = normalized_ip or identity.ip_address
        identity.view_count += 1
        identity.last_seen_at = now
        identity.save()
        return identity

    return PublicViewer.create(
        tenant=tenant,
        price_list=price_list,
        name=name.strip(),
        email=normalized_email,
        phone=normalized_phone,
        visitor_token=token,
        ip_address=normalized_ip,
        view_count=1,
        last_seen_at=now,
    )


def has_viewer(tenant_id: str, visitor_token: str | None) -> bool:
    token = _normalize_token(visitor_token)
    if not token:
        return False
    return (
        PublicViewer.select()
        .where(
            (PublicViewer.tenant == tenant_id) & (PublicViewer.visitor_token == token)
        )
        .exists()
    )


def _normalize_token(value: str | None) -> str | None:
    if not value or not re.fullmatch(r"[A-Za-z0-9_-]{32,64}", value):
        return None
    return value


def _normalize_ip(value: str | None) -> str | None:
    if not value:
        return None
    try:
        return str(ipaddress.ip_address(value.strip()))
    except ValueError:
        return None


def _normalize_phone(value: str | None) -> str | None:
    if not value:
        return None
    compact = re.sub(r"[^0-9+]", "", value.strip())
    return compact or None
