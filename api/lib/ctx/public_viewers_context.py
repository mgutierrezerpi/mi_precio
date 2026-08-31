"""Capture and list contacts who identify themselves on public lists."""

import ipaddress
import re
import secrets
from datetime import datetime


from models import (
    Customer,
    PriceList,
    PublicViewer,
    PublicViewerDismissal,
    Tenant,
)

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

    now = datetime.utcnow()
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


def record_anonymous_dismissal(tenant_id: str, list_id: str) -> bool:
    """Increment an aggregate dismissal count without identifying the visitor."""
    price_list = PriceList.get_or_none(
        (PriceList.id == list_id) & (PriceList.tenant == tenant_id)
    )
    if not price_list or not price_list.published or not price_list.capture_viewer_info:
        return False

    record, created = PublicViewerDismissal.get_or_create(
        tenant=tenant_id,
        price_list=price_list.id,
        defaults={
            "dismissal_count": 1,
            "last_seen_at": datetime.utcnow(),
        },
    )
    if not created:
        record.dismissal_count += 1
        record.last_seen_at = datetime.utcnow()
        record.save()
    return True


def anonymous_dismissal_count(tenant_id: str) -> int:
    return sum(
        record.dismissal_count
        for record in PublicViewerDismissal.select().where(
            PublicViewerDismissal.tenant == tenant_id
        )
    )


def has_viewer(tenant_id: str, visitor_token: str | None) -> bool:
    token = _normalize_token(visitor_token)
    if not token:
        return False
    return PublicViewer.select().where(
        (PublicViewer.tenant == tenant_id) & (PublicViewer.visitor_token == token)
    ).exists()


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
            (PublicViewer.tenant == tenant_id)
            & (PublicViewer.visitor_token == token)
        )
        .order_by(PublicViewer.last_seen_at.desc())
        .first()
    )
    if not source:
        return False

    now = datetime.utcnow()
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
    if not price_list or not price_list.published or not price_list.capture_viewer_info:
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
            tenant=tenant_id,
            price_list=price_list,
            name=source.name,
            email=source.email,
            phone=source.phone,
            customer_id=source.customer_id,
            visitor_token=token,
            ip_address=normalized_ip or source.ip_address,
            view_count=1,
            last_seen_at=now,
        )
    return True


def list_viewers(tenant_id: str) -> list[PublicViewer]:
    """Return identified viewers, newest first, with their list relation loaded."""
    return list(
        PublicViewer.select(PublicViewer, PriceList)
        .join(PriceList)
        .where(PublicViewer.tenant == tenant_id)
        .order_by(PublicViewer.last_seen_at.desc())
    )


def promote_viewer(tenant_id: str, viewer_id: str) -> Customer | None:
    """Create or reuse a CRM customer for an identified public viewer.

    The viewer remains the source record, but stores the customer link so the
    operation is safe to repeat and the owner can open the promoted customer.
    """
    viewer = PublicViewer.get_or_none(
        (PublicViewer.id == viewer_id) & (PublicViewer.tenant == tenant_id)
    )
    if not viewer:
        return None

    linked_customer_id = getattr(viewer, "customer_id", None)
    if linked_customer_id:
        customer = Customer.get_or_none(
            (Customer.id == linked_customer_id) & (Customer.tenant == tenant_id)
        )
        if customer:
            return customer

    email = viewer.email.strip().lower() if viewer.email else None
    phone = _normalize_phone(viewer.phone)
    customer = _find_customer(tenant_id, email, phone)
    if not customer:
        customer = Customer.create(
            tenant=tenant_id,
            name=viewer.name,
            email=email,
            phone=phone,
        )
    else:
        # Preserve CRM edits, but complete contact details that were absent.
        changed = False
        if not customer.email and email:
            customer.email = email
            changed = True
        if not customer.phone and phone:
            customer.phone = phone
            changed = True
        if changed:
            customer.save()

    viewer.customer_id = customer.id
    viewer.save()
    return customer


def _find_customer(
    tenant_id: str, email: str | None, phone: str | None
) -> Customer | None:
    """Match a viewer to an existing CRM contact without crossing tenants."""
    if not email and not phone:
        return None
    for customer in Customer.select().where(Customer.tenant == tenant_id):
        customer_email = customer.email.strip().lower() if customer.email else None
        customer_phone = _normalize_phone(customer.phone)
        if (email and customer_email == email) or (phone and customer_phone == phone):
            return customer
    return None


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
