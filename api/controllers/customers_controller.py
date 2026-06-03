from fastapi import APIRouter, HTTPException, Depends
from lib.ctx import customers
from controllers.deps import get_current_user
from controllers.input_types import CreateCustomer, UpdateCustomer, CreateOrder
from views import DeletedView, CustomerView, OrderView

router = APIRouter(tags=["customers"])


@router.get("/tenants/{tenant_id}/customers")
def list_customers_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return CustomerView.render_many(customers.list_customers(tenant_id))


@router.get("/tenants/{tenant_id}/customers/stats")
def customer_stats_endpoint(tenant_id: str, current_user: dict = Depends(get_current_user)):
    return customers.customer_stats(tenant_id)


@router.post("/tenants/{tenant_id}/customers", status_code=201)
def create_customer_endpoint(tenant_id: str, data: CreateCustomer, current_user: dict = Depends(get_current_user)):
    customer = customers.create_customer(tenant_id, **data.model_dump())
    if not customer:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return CustomerView.render(customer)


@router.get("/customers/{customer_id}")
def get_customer_endpoint(customer_id: str, current_user: dict = Depends(get_current_user)):
    """Customer detail: profile + aggregates + full purchase history."""
    customer = customers.get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    orders = customers.list_orders(customer_id)
    return {"customer": CustomerView.render(customer), "orders": OrderView.render_many(orders)}


@router.patch("/customers/{customer_id}")
def update_customer_endpoint(customer_id: str, data: UpdateCustomer, current_user: dict = Depends(get_current_user)):
    customer = customers.update_customer(customer_id, **data.model_dump(exclude_unset=True))
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return CustomerView.render(customer)


@router.delete("/customers/{customer_id}")
def delete_customer_endpoint(customer_id: str, current_user: dict = Depends(get_current_user)):
    if not customers.delete_customer(customer_id):
        raise HTTPException(status_code=404, detail="Customer not found")
    return DeletedView()


@router.post("/customers/{customer_id}/orders", status_code=201)
def create_order_endpoint(customer_id: str, data: CreateOrder, current_user: dict = Depends(get_current_user)):
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
    return OrderView.render(order)


@router.delete("/orders/{order_id}")
def delete_order_endpoint(order_id: str, current_user: dict = Depends(get_current_user)):
    if not customers.delete_order(order_id):
        raise HTTPException(status_code=404, detail="Order not found")
    return DeletedView()
