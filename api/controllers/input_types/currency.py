"""Currency codes as the API accepts them.

Every screen formats prices with ``Intl.NumberFormat``, which throws on a code
that is not three letters, and one bad value on the tenant used to take the
whole Products screen down. So codes are checked on the way in.
"""

import re
from typing import Annotated

from pydantic import AfterValidator


def normalize_currency(value: str) -> str:
    code = value.strip().upper()
    if not re.fullmatch(r"[A-Z]{3}", code):
        raise ValueError(
            "La moneda tiene que ser un código de 3 letras, como UYU o USD."
        )
    return code


Currency = Annotated[str, AfterValidator(normalize_currency)]
