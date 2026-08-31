"""Customer purchase-history operations."""

from decimal import Decimal

from models import Customer, Order, OrderItem


def list_orders(customer_id: str) -> list[Order]:
    """A customer's purchases, newest first."""
    return list(
        Order.select()
        .where(Order.customer == customer_id)
        .order_by(Order.created_at.desc())
    )


def create_order(
    customer_id: str,
    items: list[dict],
    status: str = "paid",
    note: str | None = None,
    currency: str | None = None,
    reference: str | None = None,
) -> Order | None:
    """Register a purchase, computing the total from its items."""
    customer = Customer.get_or_none(Customer.id == customer_id)
    if not customer:
        return None

    line_items = items or []
    total = sum(
        (Decimal(str(item["unit_price"])) * int(item.get("quantity", 1)) for item in line_items),
        Decimal(0),
    )
    order = Order.create(
        tenant=customer.tenant,
        customer=customer,
        reference=reference,
        total=total,
        currency=currency or customer.tenant.currency,
        status=status,
        note=note,
    )
    for item in line_items:
        OrderItem.create(
            order=order,
            name=item["name"],
            quantity=int(item.get("quantity", 1)),
            unit_price=Decimal(str(item["unit_price"])),
        )
    return order


def update_order(
    order_id: str, items: list[dict] | None = None, **fields
) -> Order | None:
    """Update fields and, when supplied, replace lines and recompute total."""
    order = Order.get_or_none(Order.id == order_id)
    if not order:
        return None
    for key, value in fields.items():
        setattr(order, key, value)

    if items is not None:
        OrderItem.delete().where(OrderItem.order == order.id).execute()
        total = Decimal(0)
        for item in items:
            quantity = int(item.get("quantity", 1))
            price = Decimal(str(item["unit_price"]))
            OrderItem.create(
                order=order,
                name=item["name"],
                quantity=quantity,
                unit_price=price,
            )
            total += price * quantity
        order.total = total

    order.save()
    return order


def delete_order(order_id: str) -> bool:
    """Delete an order and its line items."""
    order = Order.get_or_none(Order.id == order_id)
    if not order:
        return False
    order.delete_instance(recursive=True)
    return True
