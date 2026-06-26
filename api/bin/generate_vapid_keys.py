#!/usr/bin/env python
"""Generate a VAPID key pair for Web Push (PWA notifications).

Run it once and copy the two values into your environment (.env / compose):

    pipenv run python bin/generate_vapid_keys.py

VAPID_PUBLIC_KEY  -> handed to the browser as the applicationServerKey.
VAPID_PRIVATE_KEY -> kept secret; signs the push requests.

Both are the URL-safe base64 (no padding) raw key encodings the Web Push spec
and pywebpush expect."""

import base64

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec


def _b64url(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def main() -> None:
    private_key = ec.generate_private_key(ec.SECP256R1())
    private_raw = private_key.private_numbers().private_value.to_bytes(32, "big")
    public_raw = private_key.public_key().public_bytes(
        serialization.Encoding.X962,
        serialization.PublicFormat.UncompressedPoint,
    )
    print("VAPID_PUBLIC_KEY=" + _b64url(public_raw))
    print("VAPID_PRIVATE_KEY=" + _b64url(private_raw))


if __name__ == "__main__":
    main()
