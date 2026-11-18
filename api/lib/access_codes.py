"""Private-list access codes: stored hashed, compared without regard to case.

Codes travel in QR codes, messages and over the phone, where «ABCD1234» easily
becomes «abcd1234». New hashes are taken from the case-folded code. Hashes from
before this keep the casing the shop typed, which cannot be recovered from the
digest, so those are also tried against the usual ways of writing a code.
"""

import hashlib
import hmac
import secrets


def hash_access_code(code: str) -> str:
    salt = secrets.token_bytes(16)
    return f"{salt.hex()}${_digest(_normalize(code), salt)}"


def access_code_matches(stored: str | None, code: str | None) -> bool:
    """Whether ``code`` opens ``stored``, in any casing a hash can still tell."""
    typed = (code or "").strip()
    if not stored or not typed:
        return False
    candidates = dict.fromkeys((_normalize(typed), typed.upper(), typed))
    return any(_digest_matches(stored, candidate) for candidate in candidates)


def needs_rehash(stored: str, code: str) -> bool:
    """Whether a code that just matched still has a case-sensitive hash."""
    return not _digest_matches(stored, _normalize(code))


def _normalize(code: str) -> str:
    return code.strip().casefold()


def _digest(code: str, salt: bytes) -> str:
    return hashlib.scrypt(code.encode("utf-8"), salt=salt, n=2**14, r=8, p=1).hex()


def _digest_matches(stored: str, code: str) -> bool:
    try:
        salt_hex, expected = stored.split("$", 1)
        return hmac.compare_digest(_digest(code, bytes.fromhex(salt_hex)), expected)
    except (ValueError, TypeError):
        return False
