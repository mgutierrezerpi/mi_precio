"""The importer only fetches public pages (R2)."""

import socket

import httpx
import pytest

from lib.services import safe_fetch
from lib.services.safe_fetch import UnsafeUrlError, safe_get

H = {"User-Agent": "test"}


@pytest.mark.parametrize(
    "url",
    [
        "http://127.0.0.1:8000/api/v1/tenants",
        "http://169.254.169.254/latest/meta-data/",
        "http://10.0.0.5/",
        "http://[::1]/",
        "file:///etc/passwd",
        "ftp://example.com/menu",
    ],
)
def test_private_or_odd_destinations_are_refused(url):
    with pytest.raises(UnsafeUrlError):
        safe_get(url, headers=H, timeout=5, max_bytes=1000)


def _public(monkeypatch):
    monkeypatch.setattr(
        socket,
        "getaddrinfo",
        lambda host, port: [(None, None, None, "", ("93.184.216.34", 0))],
    )


def test_a_redirect_to_an_internal_address_is_refused(monkeypatch):
    calls = []

    def handler(request):
        calls.append(str(request.url))
        return httpx.Response(302, headers={"location": "http://169.254.169.254/"})

    _public_then_private = iter(["93.184.216.34", "169.254.169.254"])
    monkeypatch.setattr(
        socket,
        "getaddrinfo",
        lambda host, port: [(None, None, None, "", (next(_public_then_private), 0))],
    )
    monkeypatch.setattr(
        safe_fetch.httpx, "Client", _client_with(handler, safe_fetch.httpx.Client)
    )
    with pytest.raises(UnsafeUrlError):
        safe_get("http://menu.example/", headers=H, timeout=5, max_bytes=1000)
    assert calls == ["http://menu.example/"]


def test_a_huge_body_is_cut(monkeypatch):
    _public(monkeypatch)
    monkeypatch.setattr(
        safe_fetch.httpx,
        "Client",
        _client_with(
            lambda r: httpx.Response(200, content=b"x" * 5000), safe_fetch.httpx.Client
        ),
    )
    with pytest.raises(UnsafeUrlError):
        safe_get("http://menu.example/", headers=H, timeout=5, max_bytes=1000)


def test_a_normal_public_page_is_returned(monkeypatch):
    _public(monkeypatch)
    monkeypatch.setattr(
        safe_fetch.httpx,
        "Client",
        _client_with(
            lambda r: httpx.Response(200, text="<p>Menú</p>"), safe_fetch.httpx.Client
        ),
    )
    response = safe_get("http://menu.example/", headers=H, timeout=5, max_bytes=1000)
    assert response.text == "<p>Menú</p>"


def test_a_gzipped_page_is_decoded_once(monkeypatch):
    import gzip

    _public(monkeypatch)
    page = gzip.compress("<p>Menú</p>".encode())
    monkeypatch.setattr(
        safe_fetch.httpx,
        "Client",
        _client_with(
            lambda r: httpx.Response(
                200, content=page, headers={"content-encoding": "gzip"}
            ),
            safe_fetch.httpx.Client,
        ),
    )
    response = safe_get("http://menu.example/", headers=H, timeout=5, max_bytes=1000)
    assert response.text == "<p>Menú</p>"


def _client_with(handler, real_client):
    def factory(**kwargs):
        return real_client(transport=httpx.MockTransport(handler), **kwargs)

    return factory
