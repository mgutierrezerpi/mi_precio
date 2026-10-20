"""Paid-order aggregates used by analytics reports."""

from decimal import Decimal

from peewee import Case, fn

from models import Order, OrderItem, Tenant


def _shop_currency(tenant_id: str) -> str:
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    return (tenant.currency if tenant else None) or "UYU"


def paid_revenue(tenant_id: str) -> Decimal:
    """Paid revenue in the shop's currency. Orders in another currency are
    left out instead of being added as if they were the same money."""
    revenue = (
        Order.select(fn.COALESCE(fn.SUM(Order.total), 0))
        .where(
            Order.tenant == tenant_id,
            Order.status == "paid",
            Order.currency == _shop_currency(tenant_id),
        )
        .scalar()
    )
    return revenue or Decimal(0)


def top_products(tenant_id: str) -> list[dict]:
    rows = (
        OrderItem.select(
            OrderItem.name,
            fn.SUM(OrderItem.quantity).alias("units"),
            # Units count every sale; revenue only the shop's currency.
            fn.SUM(
                Case(
                    None,
                    [
                        (
                            Order.currency == _shop_currency(tenant_id),
                            OrderItem.quantity * OrderItem.unit_price,
                        )
                    ],
                    0,
                )
            ).alias("revenue"),
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
