"""Field types shared by products and list items.

Before these the API stored negative prices (the public cart subtracted
them), names made only of spaces or 5000 characters long, and a PATCH with
`"price": null` reached the NOT NULL column and answered 500.
"""

from typing import Annotated

from pydantic import AfterValidator

NAME_MAX_LENGTH = 200
PRICE_MAX = 1_000_000_000


def clean_name(value: str) -> str:
    name = value.strip()
    if not name:
        raise ValueError("El nombre no puede quedar vacío.")
    if len(name) > NAME_MAX_LENGTH:
        raise ValueError(f"El nombre puede tener hasta {NAME_MAX_LENGTH} caracteres.")
    return name


CatalogName = Annotated[str, AfterValidator(clean_name)]


def check_price(value: float) -> float:
    if value < 0:
        raise ValueError("El precio no puede ser negativo.")
    if value > PRICE_MAX:
        raise ValueError("El precio es demasiado alto.")
    return value


Price = Annotated[float, AfterValidator(check_price)]


def reject_nulls(data: object, fields: tuple[str, ...]) -> object:
    """For PATCH bodies: a field may be left out, but not sent as null when its
    column can not hold one."""
    if isinstance(data, dict):
        nulled = [name for name in fields if name in data and data[name] is None]
        if nulled:
            raise ValueError(f"{', '.join(nulled)} no puede ser null.")
    return data
