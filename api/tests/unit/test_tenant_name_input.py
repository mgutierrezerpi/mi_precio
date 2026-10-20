"""The business name can not be saved empty (A10)."""

import pytest
from pydantic import ValidationError

from controllers.input_types.create_tenant import CreateTenant
from controllers.input_types.update_tenant import UpdateTenant


@pytest.mark.parametrize("blank", ["", "   "])
def test_blank_name_is_rejected(blank):
    with pytest.raises(ValidationError):
        UpdateTenant(name=blank)
    with pytest.raises(ValidationError):
        CreateTenant(name=blank)


def test_name_is_trimmed_and_capped():
    assert UpdateTenant(name="  Café Aurora ").name == "Café Aurora"
    with pytest.raises(ValidationError):
        UpdateTenant(name="x" * 121)


def test_name_stays_optional_on_updates():
    assert UpdateTenant(currency="UYU").name is None
