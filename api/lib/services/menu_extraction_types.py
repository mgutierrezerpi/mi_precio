"""Value objects returned by menu extraction services."""

from dataclasses import dataclass


@dataclass
class MenuItem:
    """A menu item extracted from a business page or image."""

    name: str
    price: float
    description: str | None = None
