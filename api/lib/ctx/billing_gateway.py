"""Lemon Squeezy transport, variant mapping, and signature checks."""

from __future__ import annotations

import hashlib
import hmac
import json
from typing import Any
from urllib import error, parse, request

from config import settings
from lib.ctx.billing_common import BillingError


def _lemonsqueezy_get(path: str, params: dict[str, str]) -> dict[str, Any]:
    query = parse.urlencode(params)
    req = request.Request(
        f"https://api.lemonsqueezy.com/v1/{path}?{query}",
        method="GET",
        headers={
            "Accept": "application/vnd.api+json",
            "Authorization": f"Bearer {settings.lemonsqueezy_api_key}",
        },
    )
    try:
        with request.urlopen(req, timeout=10) as res:
            return json.loads(res.read().decode("utf-8"))
    except (error.HTTPError, error.URLError, TimeoutError, OSError) as exc:
        raise BillingError("Lemon Squeezy subscription lookup failed") from exc


def _ls_request(
    method: str, path: str, payload: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Call the Lemon Squeezy API and return its decoded JSON body."""
    if not settings.lemonsqueezy_api_key:
        raise BillingError("Lemon Squeezy is not configured")
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = request.Request(
        f"https://api.lemonsqueezy.com/v1/{path.lstrip('/')}",
        data=body,
        method=method,
        headers={
            "Accept": "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            "Authorization": f"Bearer {settings.lemonsqueezy_api_key}",
        },
    )
    try:
        with request.urlopen(req, timeout=10) as response:
            raw = response.read().decode("utf-8")
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise BillingError(f"Lemon Squeezy {method} {path} failed: {detail}") from exc
    except OSError as exc:
        raise BillingError(f"Lemon Squeezy {method} {path} request failed") from exc
    return json.loads(raw) if raw else {}


def _variant_to_plan() -> dict[str, str]:
    mapping: dict[str, str] = {}
    if settings.lemonsqueezy_variant_micro:
        mapping[settings.lemonsqueezy_variant_micro] = "micro"
    if settings.lemonsqueezy_variant_plus:
        mapping[settings.lemonsqueezy_variant_plus] = "plus"
    if settings.lemonsqueezy_variant_pyme:
        mapping[settings.lemonsqueezy_variant_pyme] = "plus"
    if settings.lemonsqueezy_variant_pro:
        mapping[settings.lemonsqueezy_variant_pro] = "pro"
    return mapping


def plan_for_variant(variant_id: str | int | None) -> str | None:
    if variant_id is None:
        return None
    return _variant_to_plan().get(str(variant_id))


def variant_for_plan(plan: str) -> str:
    if plan == "micro":
        return settings.lemonsqueezy_variant_micro
    if plan == "plus":
        return settings.lemonsqueezy_variant_plus or settings.lemonsqueezy_variant_pyme
    if plan == "pro":
        return settings.lemonsqueezy_variant_pro
    raise BillingError("Only paid plans can create Lemon Squeezy checkouts")


def verify_lemonsqueezy_signature(raw_body: bytes, signature: str | None) -> bool:
    if not settings.lemonsqueezy_webhook_secret or not signature:
        return False
    digest = hmac.new(
        settings.lemonsqueezy_webhook_secret.encode("utf-8"), raw_body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(digest, signature)
