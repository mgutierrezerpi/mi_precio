"""Subscription plan definitions shared by enforcement and billing."""

PLANS: dict[str, dict[str, int | None]] = {
    "free": {"products": 10, "lists": 1, "members": 1},
    "micro": {"products": 25, "lists": 3, "members": 1},
    "plus": {"products": 300, "lists": 15, "members": 5},
    "pro": {"products": None, "lists": None, "members": None},
}
PLAN_ORDER = ["free", "micro", "plus", "pro"]

PLAN_FEATURES: dict[str, set[str]] = {
    "free": set(),
    "micro": set(),
    "plus": {"leads"},
    "pro": {"leads"},
}

LIMIT_MESSAGE = {
    "products": "Alcanzaste el límite de productos de tu plan. Subí de plan para agregar más.",
    "lists": "Alcanzaste el límite de listas de tu plan. Subí de plan para crear más.",
    "members": "Alcanzaste el límite de miembros de tu plan. Subí de plan para invitar a más personas.",
}


class PlanLimitError(Exception):
    """Raised when an action would exceed a tenant plan limit (HTTP 402)."""
