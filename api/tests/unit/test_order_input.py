"""Orders only take real quantities and known statuses (R8)."""

import pytest
from pydantic import ValidationError

from controllers.input_types.create_order import CreateOrder, UpdateOrder

ITEM = {"name": "Café", "quantity": 1, "unit_price": 100}


@pytest.mark.parametrize("quantity", [-3, 0, 10_001])
def test_quantity_must_be_positive_and_sane(quantity):
    with pytest.raises(ValidationError):
        CreateOrder(items=[{**ITEM, "quantity": quantity}])


def test_negative_unit_price_is_refused():
    with pytest.raises(ValidationError):
        CreateOrder(items=[{**ITEM, "unit_price": -5}])


@pytest.mark.parametrize("model", [CreateOrder, UpdateOrder])
def test_status_must_be_known(model):
    with pytest.raises(ValidationError):
        model(items=[ITEM], status="regalado")
    assert model(items=[ITEM], status="pending").status == "pending"


def test_a_normal_order_still_passes():
    order = CreateOrder(items=[ITEM, {**ITEM, "quantity": 2}])
    assert [i.quantity for i in order.items] == [1, 2]
    assert order.status == "paid"
    assert UpdateOrder(note="ok").status is None
