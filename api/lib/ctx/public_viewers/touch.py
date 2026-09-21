"""Cookie-identified public viewer visit operations."""

import ipaddress
import re

from models import PriceList, PublicViewer
from models.base import utc_now


def touch_viewer(
    tenant_id: str,
    visitor_token: str | None,
    list_id: str | None = None,
    ip_address: str | None = None,
) -> bool:
    """Record a cookie-identified visit without requiring the prompt again."""
    token = _normalize_token(visitor_token)
    if not token:
        return False
    source = (
        PublicViewer.select()
        .where(
            (PublicViewer.tenant == tenant_id) & (PublicViewer.visitor_token == token)
        )
        .order_by(PublicViewer.last_seen_at.desc())
        .first()
    )
    if not source:
        return False

    now = utc_now()
    normalized_ip = _normalize_ip(ip_address)
    if not list_id:
        source.view_count += 1
        source.last_seen_at = now
        source.ip_address = normalized_ip or source.ip_address
        source.save()
        return True
    price_list = PriceList.get_or_none(
        (PriceList.id == list_id) & (PriceList.tenant == tenant_id)
    )
    is_customer_private = bool(price_list and price_list.is_private)
    if not price_list or not price_list.published or (
        not price_list.capture_viewer_info and not is_customer_private
    ):
        return False
    identity = PublicViewer.get_or_none(
        (PublicViewer.tenant == tenant_id)
        & (PublicViewer.price_list == list_id)
        & (PublicViewer.visitor_token == token)
    )
    if identity:
        identity.view_count += 1
        identity.last_seen_at = now
        identity.ip_address = normalized_ip or identity.ip_address
        identity.save()
    else:
        PublicViewer.create(
            tenant=tenant_id, price_list=price_list, name=source.name,
            email=source.email, phone=source.phone, customer_id=source.customer_id,
            visitor_token=token, ip_address=normalized_ip or source.ip_address,
            view_count=1, last_seen_at=now,
        )
    return True


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
