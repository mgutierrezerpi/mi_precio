"""Products and list items reject what the CRM can not show (M2, M3, M4)."""

import pytest
from pydantic import ValidationError

from controllers.input_types import CreateItem, CreateProduct, UpdateItem, UpdateProduct


@pytest.mark.parametrize("model", [CreateProduct, CreateItem])
def test_negative_price_is_rejected(model):
    # M2: «UYU -5» reached the public page and subtracted from the cart total.
    with pytest.raises(ValidationError):
        model(name="Café", price=-5)
    assert model(name="Café", price=0).price == 0


@pytest.mark.parametrize("name", ["   ", "", "x" * 201])
def test_blank_or_huge_name_is_rejected(name):
    # M3
    with pytest.raises(ValidationError):
        CreateProduct(name=name, price=1)
    with pytest.raises(ValidationError):
        UpdateItem(name=name)


def test_name_is_trimmed():
    assert CreateProduct(name="  Café  ", price=1).name == "Café"


@pytest.mark.parametrize("field", ["name", "price", "currency", "available"])
def test_patch_can_not_null_a_required_column(field):
    # M4: {"price": null} used to reach the NOT NULL column and answer 500.
    with pytest.raises(ValidationError):
        UpdateProduct.model_validate({field: None})


def test_patch_can_still_clear_optional_fields_and_leave_others_out():
    patch = UpdateProduct.model_validate({"sku": None, "category": None})
    assert patch.model_dump(exclude_unset=True) == {"sku": None, "category": None}
    with pytest.raises(ValidationError):
        UpdateItem.model_validate({"price": None})
