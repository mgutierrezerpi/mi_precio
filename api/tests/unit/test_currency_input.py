"""Currency codes are checked on the way in (A8)."""

import pytest
from pydantic import ValidationError

from controllers.input_types import CreateProduct
from controllers.input_types.update_tenant import UpdateTenant


def test_currency_is_normalized_to_upper_case():
    assert UpdateTenant(currency=" usd ").currency == "USD"
    assert CreateProduct(name="Café", price=1, currency="uyu").currency == "UYU"


@pytest.mark.parametrize("bad", ["pesos", "U$", "", "US1"])
def test_currency_that_intl_cannot_format_is_rejected(bad):
    # One of these on the tenant used to crash the Products screen.
    with pytest.raises(ValidationError):
        UpdateTenant(currency=bad)


def test_currency_stays_optional_on_updates():
    assert UpdateTenant(name="Shop").currency is None
