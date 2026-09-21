"""Paid-order aggregates used by analytics reports."""

from decimal import Decimal

from peewee import fn

from models import Order, OrderItem


def paid_revenue(tenant_id: str) -> Decimal:
    revenue = (
        Order.select(fn.COALESCE(fn.SUM(Order.total), 0))
        .where(Order.tenant == tenant_id, Order.status == "paid")
        .scalar()
    )
    return revenue or Decimal(0)


def top_products(tenant_id: str) -> list[dict]:
    rows = (
        OrderItem.select(
            OrderItem.name,
            fn.SUM(OrderItem.quantity).alias("units"),
            fn.SUM(OrderItem.quantity * OrderItem.unit_price).alias("revenue"),
        )
        .join(Order)
        .where(Order.tenant == tenant_id, Order.status == "paid")
        .group_by(OrderItem.name)
        .order_by(fn.SUM(OrderItem.quantity).desc())
        .limit(5)
        .dicts()
    )
    return [
        {
            "name": row["name"],
            "units": int(row["units"] or 0),
            "revenue": str(row["revenue"] or 0),
        }
        for row in rows
    ]
