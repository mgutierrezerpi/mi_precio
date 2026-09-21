from views.base_view import BaseView
from views.customer_view import CustomerView
from views.lead_view import LeadView
from views.order_view import OrderView


class CustomerStatsView(BaseView):
    total: int
    active: int
    new: int
    recurring: int

    @classmethod
    def render(cls, stats: dict):
        return cls.model_validate(stats)


class CustomerDetailView(BaseView):
    customer: CustomerView
    orders: list[OrderView]
    submissions: list[LeadView]

    @classmethod
    def render(cls, customer, orders, submissions):
        return cls(
            customer=CustomerView.render(customer),
            orders=OrderView.render_many(orders),
            submissions=LeadView.render_many(submissions),
        )
