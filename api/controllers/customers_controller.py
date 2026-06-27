from fastapi import APIRouter, HTTPException, Depends
from lib.ctx import customers, activity
from controllers import ownership
from controllers.deps import get_current_user, require_editor
from controllers.input_types import CreateCustomer, UpdateCustomer, CreateOrder, UpdateOrder
from views import DeletedView, CustomerView, OrderView

router = APIRouter(tags=["customers"])


@router.get("/tenants/{tenant_id}/customers")
def list_customers_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return CustomerView.render_many(customers.list_customers(tenant_id))


@router.get("/tenants/{tenant_id}/customers/stats")
def customer_stats_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return customers.customer_stats(tenant_id)


@router.post("/tenants/{tenant_id}/customers", status_code=201)
def create_customer_endpoint(tenant_id: str, data: CreateCustomer, current_user: dict = Depends(require_editor)):
    customer = customers.create_customer(tenant_id, **data.model_dump())
    if not customer:
        raise HTTPException(status_code=404, detail="Tenant not found")
    activity.record(tenant_id, "customer.created", f"Agregó el cliente «{customer.name}»",
                    actor=current_user.get("email"), actor_id=current_user.get("sub"),
                    entity_type="customer", entity_id=customer.id)
    return CustomerView.render(customer)


@router.get("/customers/{customer_id}")
def get_customer_endpoint(customer_id: str, current_user: dict = Depends(get_current_user)):
    """Customer detail: profile + aggregates + full purchase history."""
    customer = ownership.own_customer(customer_id, current_user)
    orders = customers.list_orders(customer_id)
    return {"customer": CustomerView.render(customer), "orders": OrderView.render_many(orders)}


@router.patch("/customers/{customer_id}")
def update_customer_endpoint(customer_id: str, data: UpdateCustomer, current_user: dict = Depends(require_editor)):
    ownership.own_customer(customer_id, current_user)
    customer = customers.update_customer(customer_id, **data.model_dump(exclude_unset=True))
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return CustomerView.render(customer)


@router.delete("/customers/{customer_id}")
def delete_customer_endpoint(customer_id: str, current_user: dict = Depends(require_editor)):
    ownership.own_customer(customer_id, current_user)
    if not customers.delete_customer(customer_id):
        raise HTTPException(status_code=404, detail="Customer not found")
    return DeletedView()


@router.post("/customers/{customer_id}/orders", status_code=201)
def create_order_endpoint(customer_id: str, data: CreateOrder, current_user: dict = Depends(require_editor)):
    ownership.own_customer(customer_id, current_user)
    order = customers.create_order(
        customer_id,
        items=[i.model_dump() for i in data.items],
        status=data.status,
        note=data.note,
        currency=data.currency,
        reference=data.reference,
    )
    if not order:
        raise HTTPException(status_code=404, detail="Customer not found")
    activity.record(order.tenant_id, "order.created",
                    f"Registró una compra de «{order.customer.name}» por {order.currency} {order.total:.0f}",
                    actor=current_user.get("email"), actor_id=current_user.get("sub"),
                    entity_type="order", entity_id=order.id)
    return OrderView.render(order)


@router.patch("/orders/{order_id}")
def update_order_endpoint(order_id: str, data: UpdateOrder, current_user: dict = Depends(require_editor)):
    ownership.own_order(order_id, current_user)
    payload = data.model_dump(exclude_unset=True)
    items = payload.pop("items", None)
    order = customers.update_order(order_id, items=items, **payload)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderView.render(order)


@router.delete("/orders/{order_id}")
def delete_order_endpoint(order_id: str, current_user: dict = Depends(require_editor)):
    ownership.own_order(order_id, current_user)
    if not customers.delete_order(order_id):
        raise HTTPException(status_code=404, detail="Order not found")
    return DeletedView()
