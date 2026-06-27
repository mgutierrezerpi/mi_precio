"""Resource-level tenant ownership guards.

Resource endpoints address a row by its own id (e.g. /items/{id}, /lists/{id})
instead of /tenants/{id}/..., so the global isolation middleware (app.py) can't
guard them. Each guard loads the resource, resolves its owning tenant, and
returns it only if it belongs to the caller — otherwise it raises 404 (not 403)
so we never reveal that an id exists under another tenant.

Use these at the top of every resource-scoped endpoint, passing the parent
resource for nested routes (e.g. own_version for /versions/{id}/items)."""

from fastapi import HTTPException

from models import Category, Customer, Item, ListVersion, Order, PriceList, Product


def _denied() -> HTTPException:
    return HTTPException(status_code=404, detail="No encontrado")


def own_list(list_id: str, current_user: dict) -> PriceList:
    obj = PriceList.get_or_none(PriceList.id == list_id)
    if obj is None or obj.tenant_id != current_user.get("tenant_id"):
        raise _denied()
    return obj


def own_version(version_id: str, current_user: dict) -> ListVersion:
    obj = ListVersion.get_or_none(ListVersion.id == version_id)
    if obj is None or obj.list.tenant_id != current_user.get("tenant_id"):
        raise _denied()
    return obj


def own_item(item_id: str, current_user: dict) -> Item:
    obj = Item.get_or_none(Item.id == item_id)
    if obj is None or obj.list_version.list.tenant_id != current_user.get("tenant_id"):
        raise _denied()
    return obj


def own_customer(customer_id: str, current_user: dict) -> Customer:
    obj = Customer.get_or_none(Customer.id == customer_id)
    if obj is None or obj.tenant_id != current_user.get("tenant_id"):
        raise _denied()
    return obj


def own_order(order_id: str, current_user: dict) -> Order:
    obj = Order.get_or_none(Order.id == order_id)
    if obj is None or obj.tenant_id != current_user.get("tenant_id"):
        raise _denied()
    return obj


def own_category(category_id: str, current_user: dict) -> Category:
    obj = Category.get_or_none(Category.id == category_id)
    if obj is None or obj.tenant_id != current_user.get("tenant_id"):
        raise _denied()
    return obj


def own_product(product_id: str, current_user: dict) -> Product:
    obj = Product.get_or_none(Product.id == product_id)
    if obj is None or obj.tenant_id != current_user.get("tenant_id"):
        raise _denied()
    return obj
