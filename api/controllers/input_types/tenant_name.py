"""The business name, as every public page and the CRM header show it."""

MAX_LENGTH = 120


def clean_tenant_name(value: str) -> str:
    """Trimmed, and never empty: a blank name used to save and the header fell
    back to the user's own name."""
    name = value.strip()
    if not name:
        raise ValueError("El nombre del negocio no puede quedar vacío.")
    if len(name) > MAX_LENGTH:
        raise ValueError(
            f"El nombre del negocio puede tener hasta {MAX_LENGTH} caracteres."
        )
    return name
