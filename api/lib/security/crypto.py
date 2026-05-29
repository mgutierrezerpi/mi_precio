"""Cryptographic utilities."""

import secrets


def generate_verification_code(length: int = 6) -> str:
    """Generate a numeric verification code."""
    return "".join(str(secrets.randbelow(10)) for _ in range(length))
