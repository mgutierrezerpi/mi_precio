"""Invitations only take emails that can sign in (M14)."""

import pytest
from pydantic import ValidationError

from controllers.input_types import CreateCode, InviteMember
from controllers.input_types.update_member import UpdateMember


@pytest.mark.parametrize("email", ["ana@test.local", "ana@example", "no-es-email"])
def test_invitation_refuses_what_login_refuses(email):
    with pytest.raises(ValidationError):
        CreateCode(email=email)
    with pytest.raises(ValidationError):
        InviteMember(email=email)
    with pytest.raises(ValidationError):
        UpdateMember(email=email)


def test_valid_email_is_normalized_the_same_everywhere():
    assert InviteMember(email=" Ana@Cafe.com ").email == "ana@cafe.com"
    assert CreateCode(email="Ana@Cafe.com").email == "ana@cafe.com"
    assert UpdateMember(role="editor").email is None
