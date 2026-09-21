import importlib

from infra.storage.object_storage import ObjectStorage
from views.base_view import BaseView

storage_module = importlib.import_module("infra.storage.object_storage")


class StorageUrlView(BaseView):
    image_url: str


def test_upload_writes_to_local_storage(tmp_path, monkeypatch):
    monkeypatch.setattr(storage_module.settings, "storage_local_path", str(tmp_path))
    monkeypatch.setattr(
        storage_module.settings, "storage_public_url", "https://miprecio.app"
    )
    monkeypatch.setattr(storage_module.settings, "storage_bucket", "product-pictures")

    storage = ObjectStorage()
    url = storage.upload(
        "tenants/t/product_images/image.webp", b"image-bytes", "image/webp"
    )

    assert (
        url
        == "https://miprecio.app/product-pictures/tenants/t/product_images/image.webp"
    )
    assert (
        tmp_path / "product-pictures/tenants/t/product_images/image.webp"
    ).read_bytes() == b"image-bytes"


def test_normalize_public_url_updates_stale_local_port(monkeypatch):
    monkeypatch.setattr(
        storage_module.settings, "storage_public_url", "http://localhost:9002"
    )
    monkeypatch.setattr(storage_module.settings, "storage_bucket", "product-pictures")
    storage = ObjectStorage()

    assert storage.normalize_public_url(
        "http://localhost:9000/product-pictures/tenants/t/brand/logo.webp"
    ) == "http://localhost:9002/product-pictures/tenants/t/brand/logo.webp"


def test_normalize_public_url_leaves_external_urls_unchanged(monkeypatch):
    monkeypatch.setattr(
        storage_module.settings, "storage_public_url", "http://localhost:9002"
    )
    monkeypatch.setattr(storage_module.settings, "storage_bucket", "product-pictures")
    storage = ObjectStorage()
    external = "https://cdn.example.com/product-pictures/tenants/t/brand/logo.webp"
    assert storage.normalize_public_url(external) == external


def test_views_serialize_stale_local_object_urls_with_current_port(monkeypatch):
    monkeypatch.setattr(
        storage_module.settings, "storage_public_url", "http://localhost:9002"
    )
    monkeypatch.setattr(storage_module.settings, "storage_bucket", "product-pictures")
    view = StorageUrlView(
        image_url="http://localhost:9000/product-pictures/tenants/t/brand/logo.webp"
    )

    assert view.model_dump()["image_url"] == (
        "http://localhost:9002/product-pictures/tenants/t/brand/logo.webp"
    )
