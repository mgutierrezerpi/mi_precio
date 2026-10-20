"""Outbound HTTP for URLs that come from users (import from URL).

The importer used to `httpx.get(url, follow_redirects=True)` whatever it was
given, so a shop could make the server request its own internal network
(`http://127.0.0.1`, the cloud metadata service at 169.254.169.254, the Docker
neighbours) — directly or through a redirect — and download without limit.
Every hop is now checked before it is requested.
"""

import ipaddress
import socket
from urllib.parse import urljoin, urlsplit

import httpx

MAX_REDIRECTS = 5


class UnsafeUrlError(ValueError):
    """A URL the importer must not fetch. A ValueError so the API answers 400."""


def _check_destination(url: str) -> None:
    parts = urlsplit(url)
    if parts.scheme not in ("http", "https") or not parts.hostname:
        raise UnsafeUrlError("Usá un link que empiece con http:// o https://.")
    try:
        infos = socket.getaddrinfo(parts.hostname, parts.port or None)
    except socket.gaierror as error:
        raise UnsafeUrlError("No encontramos esa página. Revisá el link.") from error
    for info in infos:
        address = ipaddress.ip_address(info[4][0].split("%")[0])
        if not address.is_global:
            raise UnsafeUrlError("Ese link no apunta a una página pública.")


def safe_get(
    url: str, *, headers: dict, timeout: float, max_bytes: int
) -> httpx.Response:
    """GET a public URL: http(s) only, public addresses only on every redirect
    hop, and at most `max_bytes` of body."""
    with httpx.Client(
        headers=headers, timeout=timeout, follow_redirects=False
    ) as client:
        for _ in range(MAX_REDIRECTS + 1):
            _check_destination(url)
            with client.stream("GET", url) as response:
                if response.is_redirect:
                    url = urljoin(url, response.headers.get("location", ""))
                    continue
                response.raise_for_status()
                body = bytearray()
                for chunk in response.iter_bytes():
                    body.extend(chunk)
                    if len(body) > max_bytes:
                        raise UnsafeUrlError(
                            "La página es demasiado pesada para importarla."
                        )
                # The body is already decoded: drop the headers that describe
                # the wire format, or httpx would try to gunzip it again.
                headers = {
                    key: value
                    for key, value in response.headers.items()
                    if key.lower() not in ("content-encoding", "content-length")
                }
                return httpx.Response(
                    status_code=response.status_code,
                    headers=headers,
                    content=bytes(body),
                    request=response.request,
                )
    raise UnsafeUrlError("El link redirige demasiadas veces.")
