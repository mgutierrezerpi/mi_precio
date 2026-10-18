"""The one rule for an email that has to be able to sign in.

Login used EmailStr and invitations a bare str, so an invitation to
`ana@test.local` was accepted and could never be redeemed: the login form
rejects special-use domains. Everything that will later receive a login code
goes through this type.
"""

from typing import Annotated

from pydantic import AfterValidator, EmailStr, TypeAdapter, ValidationError

_EMAIL = TypeAdapter(EmailStr)


def clean_login_email(value: str) -> str:
    try:
        return _EMAIL.validate_python(value.strip()).lower()
    except ValidationError:
        raise ValueError(
            "Ese email no sirve para iniciar sesión. Revisá que esté bien escrito."
        ) from None


LoginEmail = Annotated[str, AfterValidator(clean_login_email)]
