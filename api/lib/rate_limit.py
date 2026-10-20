"""A small in-memory rate limiter for unauthenticated public endpoints.

Deliberately modest about what it is: the counters live in this process, so
they reset on deploy and are not shared if the app ever runs on more than one
machine. That is enough for what it defends against — a bot hammering the
public lead form, guessing a login code or a private list's access code — and
it costs no infrastructure. Anything more determined
needs a real store, and should be built when there is evidence of it.
"""

import time
from collections import defaultdict

# key → timestamps of recent hits, oldest first.
_hits: dict[str, list[float]] = defaultdict(list)

# Cheap guard against the dict growing forever under a distributed flood.
_MAX_KEYS = 10_000


def allow(key: str, limit: int, per_seconds: int) -> bool:
    """True when this key may act again, recording the hit if so."""
    now = time.time()
    cutoff = now - per_seconds

    if len(_hits) > _MAX_KEYS:
        _hits.clear()

    recent = [t for t in _hits[key] if t > cutoff]
    if len(recent) >= limit:
        _hits[key] = recent
        return False

    recent.append(now)
    _hits[key] = recent
    return True


def exceeded(key: str, limit: int, per_seconds: int) -> bool:
    """True when the key already used up its window, without recording a hit.

    For counting only failures: check before trying, record with `allow` only
    when the attempt failed."""
    cutoff = time.time() - per_seconds
    return len([t for t in _hits.get(key, []) if t > cutoff]) >= limit


def forget(key: str) -> None:
    """Drop a key's history, e.g. after a successful attempt."""
    _hits.pop(key, None)


def reset() -> None:
    """Only for tests."""
    _hits.clear()
