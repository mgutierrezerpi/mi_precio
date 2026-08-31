"""Promote identified public-list viewers into tenant CRM customers."""

import re

from models import Customer, PublicViewer


def promote_viewer(tenant_id: str, viewer_id: str) -> Customer | None:
    """Create or reuse a CRM customer for an identified public viewer."""
    viewer = PublicViewer.get_or_none(
        (PublicViewer.id == viewer_id) & (PublicViewer.tenant == tenant_id)
    )
    if not viewer:
        return None
    if viewer.customer_id:
        customer = Customer.get_or_none(
            (Customer.id == viewer.customer_id) & (Customer.tenant == tenant_id)
        )
        if customer:
            return customer

    email = viewer.email.strip().lower() if viewer.email else None
    phone = _normalize_phone(viewer.phone)
    customer = _find_customer(tenant_id, email, phone)
    if not customer:
        customer = Customer.create(
            tenant=tenant_id, name=viewer.name, email=email, phone=phone
        )
    else:
        if not customer.email and email:
            customer.email = email
        if not customer.phone and phone:
            customer.phone = phone
        customer.save()
    viewer.customer_id = customer.id
    viewer.save()
    return customer


def _find_customer(
    tenant_id: str, email: str | None, phone: str | None
) -> Customer | None:
    if not email and not phone:
        return None
    for customer in Customer.select().where(Customer.tenant == tenant_id):
        customer_email = customer.email.strip().lower() if customer.email else None
        customer_phone = _normalize_phone(customer.phone)
        if (email and customer_email == email) or (phone and customer_phone == phone):
            return customer
    return None


def _normalize_phone(value: str | None) -> str | None:
    if not value:
        return None
    compact = re.sub(r"[^0-9+]", "", value.strip())
    return compact or None
