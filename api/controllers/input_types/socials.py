"""Normalisers for the tenant's social links.

Whatever a shop pastes into these fields has to end up as something a browser
can open. In practice they paste three different things — a bare handle
(`@micafe`), a host-less URL (`instagram.com/micafe`) and the full link — so
each one is turned into a canonical profile URL instead of being rejected.

WhatsApp is the exception: shops know their phone number, not their wa.me URL,
so that field stores digits and the public page builds the link.
"""

import re

MAX_LENGTH = 500

# Bare handles are turned into a profile URL on these networks. Facebook is in
# here too: `facebook.com/<page>` is the shape every page URL still resolves to.
_HANDLE_BASE = {
    "instagram": "https://instagram.com/",
    "facebook": "https://facebook.com/",
    "tiktok": "https://tiktok.com/@",
}


def _looks_like_handle(value: str) -> bool:
    """A handle is a single word: no dot to make it a domain, no slash, no space."""
    return bool(re.match(r"^[A-Za-z0-9._-]+$", value)) and "." not in value


def normalize_social_url(v: str | None, network: str) -> str | None:
    """Empty means "this shop does not use this network" — the icon is hidden."""
    if v is None:
        return None
    value = v.strip()
    if not value:
        return None

    # A lone "@" is someone who started typing and gave up: that is an empty
    # field, not a link to reject and block the whole settings save over.
    value = value.lstrip("@").strip()
    if not value:
        return None

    if _looks_like_handle(value) and network in _HANDLE_BASE:
        value = f"{_HANDLE_BASE[network]}{value}"
    elif not re.match(r"^https?://", value, re.IGNORECASE):
        # `instagram.com/micafe` and `www.mishop.uy` are URLs missing a scheme,
        # not handles. Assume https rather than dropping what they typed.
        value = f"https://{value}"

    if len(value) > MAX_LENGTH:
        raise ValueError(f"{network} link must be at most {MAX_LENGTH} characters")
    # Anything that survived still has to be a plausible http(s) URL with a host:
    # a stray "javascript:alert(1)" would have been prefixed into
    # "https://javascript:alert(1)", which this rejects.
    if not re.match(r"^https?://[A-Za-z0-9.-]+\.[A-Za-z]{2,}(/[^\s]*)?$", value):
        raise ValueError(f"{network} must be a valid link")
    return value


def normalize_whatsapp(v: str | None) -> str | None:
    """Stores digits only, so the number can be shown back in the form and the
    public page can build `wa.me/<digits>` from it.

    A leading 00 is the international prefix written out; wa.me wants neither
    that nor a +, just the country code and the number."""
    if v is None:
        return None
    digits = re.sub(r"\D", "", v)
    if not digits:
        return None
    digits = re.sub(r"^00", "", digits)
    if not 6 <= len(digits) <= 15:
        raise ValueError("WhatsApp must be a phone number with its country code")
    return digits
