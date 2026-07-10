"""Tests for auth context."""

from datetime import datetime, timedelta
from models import AuthCode
from lib.ctx import auth
from lib import decode_token


def setup_function():
    auth.settings.debug = False
    auth.settings.mailer_enabled = False
    auth.settings.log_auth_codes = False


def test_send_code_creates_auth_code(db):
    code = auth.send_code("test@example.com")

    assert len(code) == 6
    assert code.isdigit()

    auth_code = AuthCode.get_or_none(AuthCode.email == "test@example.com")
    assert auth_code is not None
    assert auth_code.code == code
    assert auth_code.used is False


def test_send_code_lowercases_email(db):
    auth.send_code("TEST@EXAMPLE.COM")

    auth_code = AuthCode.get_or_none(AuthCode.email == "test@example.com")
    assert auth_code is not None


def test_send_code_deletes_previous_codes(db):
    auth.send_code("test@example.com")
    auth.send_code("test@example.com")

    count = AuthCode.select().where(AuthCode.email == "test@example.com").count()
    assert count == 1


def test_send_code_skips_mailer_in_debug(db, monkeypatch):
    called = False

    def fail_if_called(*args, **kwargs):
        nonlocal called
        called = True
        raise AssertionError("mailer should not be called in debug mode")

    auth.settings.debug = True
    monkeypatch.setattr(auth.mailer, "send", fail_if_called)

    code = auth.send_code("test@example.com")

    assert len(code) == 6
    assert called is False


def test_send_code_sends_spanish_email(db, monkeypatch):
    sent = {}
    monkeypatch.setattr(
        auth.mailer,
        "send",
        lambda **kwargs: sent.update(kwargs) or True,
    )

    code = auth.send_code("test@example.com")

    assert sent["to"] == "test@example.com"
    assert sent["subject"] == "Tu código de verificación de Mi Precio"
    assert f"Tu código de verificación es: {code}" in sent["body"]
    assert "Este código vence en 10 minutos." in sent["body"]


def test_verify_code_success(db):
    code = auth.send_code("test@example.com")
    result = auth.verify_code("test@example.com", code)

    assert result is True


def test_verify_code_marks_as_used(db):
    code = auth.send_code("test@example.com")
    auth.verify_code("test@example.com", code)

    auth_code = AuthCode.get_or_none(AuthCode.email == "test@example.com")
    assert auth_code.used is True


def test_verify_code_wrong_code(db):
    auth.send_code("test@example.com")
    result = auth.verify_code("test@example.com", "000000")

    assert result is False


def test_verify_code_wrong_email(db):
    code = auth.send_code("test@example.com")
    result = auth.verify_code("other@example.com", code)

    assert result is False


def test_verify_code_already_used(db):
    code = auth.send_code("test@example.com")
    auth.verify_code("test@example.com", code)
    result = auth.verify_code("test@example.com", code)

    assert result is False


def test_verify_code_expired(db):
    code = auth.send_code("test@example.com")

    auth_code = AuthCode.get(AuthCode.email == "test@example.com")
    auth_code.expires_at = datetime.utcnow() - timedelta(minutes=1)
    auth_code.save()

    result = auth.verify_code("test@example.com", code)
    assert result is False


def test_authenticate_success(db):
    code = auth.send_code("test@example.com")
    result = auth.authenticate("test@example.com", code)

    assert result is not None
    assert result.token is not None
    assert result.user.email == "test@example.com"
    assert result.tenant is not None


def test_authenticate_returns_valid_token(db):
    code = auth.send_code("test@example.com")
    result = auth.authenticate("test@example.com", code)

    payload = decode_token(result.token)
    assert payload is not None
    assert payload["email"] == "test@example.com"


def test_authenticate_invalid_code(db):
    auth.send_code("test@example.com")
    result = auth.authenticate("test@example.com", "000000")

    assert result is None
