"""Customers context - tenant CRM contacts and their purchase history."""

from datetime import UTC, datetime, timedelta
from decimal import Decimal
import hashlib
import secrets

from peewee import fn

from lib.ctx.customer_orders import (
    create_order,
    delete_order,
    list_orders,
    update_order,
)
from models import Customer, CustomerListAccess, Order, PriceList, Tenant

__all__ = [
    "create_customer",
    "create_order",
    "customer_stats",
    "delete_customer",
    "delete_order",
    "get_customer",
    "list_customers",
    "list_orders",
    "update_customer",
    "update_order",
]

# ── Customers ────────────────────────────────────────────────────────────


def list_customers(tenant_id: str) -> list[Customer]:
    """All customers of a tenant, newest first, each annotated with aggregates."""
    customers = list(
        Customer.select()
        .where(Customer.tenant == tenant_id)
        .order_by(Customer.created_at.desc())
    )
    for c in customers:
        _annotate(c)
    return customers


def get_customer(customer_id: str) -> Customer | None:
    """A single customer, annotated with purchase aggregates."""
    customer = Customer.get_or_none(Customer.id == customer_id)
    if customer:
        _annotate(customer)
    return customer


def create_customer(tenant_id: str, **attrs) -> Customer | None:
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not tenant:
        return None
    access_code = attrs.pop("access_code", None)
    access_list_ids = attrs.pop("access_list_ids", None)
    if access_list_ids is not None and not _private_list_ids_are_valid(tenant_id, access_list_ids):
        return None
    if access_code:
        attrs["access_code_hash"] = _hash_access_code(access_code)
    customer = Customer.create(tenant=tenant, **attrs)
    if access_list_ids is not None:
        _replace_private_list_accesses(customer, access_list_ids)
    _annotate(customer)
    return customer


def update_customer(customer_id: str, **updates) -> Customer | None:
    customer = Customer.get_or_none(Customer.id == customer_id)
    if not customer:
        return None
    if "access_code" in updates:
        access_code = updates.pop("access_code")
        updates["access_code_hash"] = (
            _hash_access_code(access_code) if access_code else None
        )
    access_list_ids = updates.pop("access_list_ids", None)
    if access_list_ids is not None and not _private_list_ids_are_valid(
        customer.tenant_id, access_list_ids
    ):
        return None
    for key, value in updates.items():
        setattr(customer, key, value)
    customer.save()
    if access_list_ids is not None:
        _replace_private_list_accesses(customer, access_list_ids)
    _annotate(customer)
    return customer


def _hash_access_code(code: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(code.encode("utf-8"), salt=salt, n=2**14, r=8, p=1).hex()
    return f"{salt.hex()}${digest}"


def _replace_private_list_accesses(customer: Customer, list_ids: list[str]) -> bool:
    """Replace a customer's grants, accepting only private lists in its tenant."""
    ids = list(dict.fromkeys(list_ids))
    valid = list(PriceList.select(PriceList.id).where(PriceList.id << ids)) if ids else []
    CustomerListAccess.delete().where(CustomerListAccess.customer == customer.id).execute()
    CustomerListAccess.insert_many(
        [{"customer": customer.id, "price_list": price_list.id} for price_list in valid]
    ).execute() if valid else None
    return True


def _private_list_ids_are_valid(tenant_id: str, list_ids: list[str]) -> bool:
    ids = list(dict.fromkeys(list_ids))
    return not ids or (
        PriceList.select()
        .where(
            (PriceList.id << ids)
            & (PriceList.tenant == tenant_id)
            & PriceList.is_private
        )
        .count()
        == len(ids)
    )


def delete_customer(customer_id: str) -> bool:
    customer = Customer.get_or_none(Customer.id == customer_id)
    if not customer:
        return False
    # Public viewer links are intentionally plain ids, so clear them before
    # deleting a customer. The table is optional in focused/legacy databases.
    database = customer._meta.database
    if database.table_exists("public_viewers"):
        database.execute_sql(
            'UPDATE "public_viewers" SET "customer_id" = NULL WHERE "customer_id" = ?',
            (customer.id,),
        )
    # Recursive delete also removes the customer's orders and their line items
    # (the DB isn't started with the SQLite foreign_keys pragma).
    customer.delete_instance(recursive=True)
    return True


# ── Stats ────────────────────────────────────────────────────────────────


def customer_stats(tenant_id: str) -> dict:
    """KPI counts for the customers screen."""
    cutoff = datetime.now(UTC).replace(tzinfo=None) - timedelta(days=30)

    total = Customer.select().where(Customer.tenant == tenant_id).count()
    new = (
        Customer.select()
        .where(Customer.tenant == tenant_id, Customer.created_at >= cutoff)
        .count()
    )

    # Customers with at least one purchase in the last 30 days.
    active = (
        Order.select(Order.customer)
        .where(Order.tenant == tenant_id, Order.created_at >= cutoff)
        .distinct()
        .count()
    )

    # Customers with 3+ purchases overall.
    grouped = (
        Order.select(Order.customer, fn.COUNT(Order.id).alias("n"))
        .where(Order.tenant == tenant_id)
        .group_by(Order.customer)
    )
    recurring = sum(1 for row in grouped if row.n >= 3)

    return {"total": total, "active": active, "new": new, "recurring": recurring}


# ── Helpers ──────────────────────────────────────────────────────────────


def _annotate(customer: Customer) -> None:
    """Attach orders_count / total_spent / last_order_at to a customer instance."""
    agg = (
        Order.select(
            fn.COUNT(Order.id).alias("orders_count"),
            fn.COALESCE(fn.SUM(Order.total), 0).alias("total_spent"),
            fn.MAX(Order.created_at).alias("last_order_at"),
        )
        .where(Order.customer == customer.id)
        .dicts()
        .get()
    )
    customer.orders_count = agg["orders_count"] or 0
    customer.total_spent = Decimal(str(agg["total_spent"] or 0))
    last = agg["last_order_at"]
    customer.last_order_at = (
        last
        if isinstance(last, datetime)
        else (datetime.fromisoformat(last) if last else None)
    )
