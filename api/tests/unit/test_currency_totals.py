"""CRM totals do not add up different currencies (R4)."""

from decimal import Decimal

from lib.ctx import customers, identity
from lib.ctx.analytics_sales import paid_revenue, top_products
from models import Order, OrderItem


def _order(tenant, customer, currency, total, name="Café"):
    order = Order.create(
        tenant=tenant, customer=customer, currency=currency, total=total, status="paid"
    )
    OrderItem.create(order=order, name=name, quantity=1, unit_price=total)
    return order


def test_customer_total_is_in_the_shop_currency_with_a_breakdown(db):
    tenant = identity.create_tenant("Café", "cafe-r4")
    customer = customers.create_customer(tenant.id, name="Carlos")
    _order(tenant, customer, "UYU", 740)
    _order(tenant, customer, "USD", 50)

    annotated = customers.get_customer(customer.id)

    assert annotated.total_spent == Decimal("740")
    assert {k: Decimal(v) for k, v in annotated.spent_by_currency.items()} == {
        "UYU": Decimal(740),
        "USD": Decimal(50),
    }


def test_revenue_and_top_products_count_only_the_shop_currency(db):
    tenant = identity.create_tenant("Café", "cafe-r4b")
    customer = customers.create_customer(tenant.id, name="Carlos")
    _order(tenant, customer, "UYU", 740)
    _order(tenant, customer, "USD", 50)

    assert paid_revenue(tenant.id) == Decimal("740")
    top = top_products(tenant.id)
    assert top[0]["units"] == 2
    assert Decimal(top[0]["revenue"]) == Decimal("740")
