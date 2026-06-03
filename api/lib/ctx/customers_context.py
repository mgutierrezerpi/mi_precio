"""Customers context - tenant CRM contacts and their purchase history."""

from datetime import datetime, timedelta
from decimal import Decimal

from peewee import fn

from models import Tenant, Customer, Order, OrderItem


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
    customer = Customer.create(tenant=tenant, **attrs)
    _annotate(customer)
    return customer


def update_customer(customer_id: str, **updates) -> Customer | None:
    customer = Customer.get_or_none(Customer.id == customer_id)
    if not customer:
        return None
    for key, value in updates.items():
        setattr(customer, key, value)
    customer.save()
    _annotate(customer)
    return customer


def delete_customer(customer_id: str) -> bool:
    customer = Customer.get_or_none(Customer.id == customer_id)
    if not customer:
        return False
    # Recursive delete also removes the customer's orders and their line items
    # (the DB isn't started with the SQLite foreign_keys pragma).
    customer.delete_instance(recursive=True)
    return True


# ── Orders (purchase history) ────────────────────────────────────────────

def list_orders(customer_id: str) -> list[Order]:
    """A customer's purchases, newest first, with their line items preloaded."""
    return list(
        Order.select()
        .where(Order.customer == customer_id)
        .order_by(Order.created_at.desc())
    )


def create_order(customer_id: str, items: list[dict], status: str = "paid",
                 note: str | None = None, currency: str | None = None,
                 reference: str | None = None) -> Order | None:
    """Register a purchase for a customer, computing the total from its items."""
    customer = Customer.get_or_none(Customer.id == customer_id)
    if not customer:
        return None

    line_items = items or []
    total = sum((Decimal(str(i["unit_price"])) * int(i.get("quantity", 1)) for i in line_items), Decimal(0))

    order = Order.create(
        tenant=customer.tenant,
        customer=customer,
        reference=reference,
        total=total,
        currency=currency or customer.tenant.currency,
        status=status,
        note=note,
    )
    for i in line_items:
        OrderItem.create(
            order=order,
            name=i["name"],
            quantity=int(i.get("quantity", 1)),
            unit_price=Decimal(str(i["unit_price"])),
        )
    return order


def delete_order(order_id: str) -> bool:
    order = Order.get_or_none(Order.id == order_id)
    if not order:
        return False
    order.delete_instance(recursive=True)  # also removes its line items
    return True


# ── Stats ────────────────────────────────────────────────────────────────

def customer_stats(tenant_id: str) -> dict:
    """KPI counts for the customers screen."""
    cutoff = datetime.utcnow() - timedelta(days=30)

    total = Customer.select().where(Customer.tenant == tenant_id).count()
    new = Customer.select().where(
        Customer.tenant == tenant_id, Customer.created_at >= cutoff
    ).count()

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
        last if isinstance(last, datetime) else (datetime.fromisoformat(last) if last else None)
    )
