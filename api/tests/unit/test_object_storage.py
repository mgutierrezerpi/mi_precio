import importlib

from infra.storage.object_storage import ObjectStorage

storage_module = importlib.import_module("infra.storage.object_storage")


def test_upload_writes_to_local_storage(tmp_path, monkeypatch):
    monkeypatch.setattr(storage_module.settings, "storage_local_path", str(tmp_path))
    monkeypatch.setattr(storage_module.settings, "storage_public_url", "https://miprecio.app")
    monkeypatch.setattr(storage_module.settings, "storage_bucket", "product-pictures")

    storage = ObjectStorage()
    url = storage.upload("tenants/t/product_images/image.webp", b"image-bytes", "image/webp")

    assert url == "https://miprecio.app/product-pictures/tenants/t/product_images/image.webp"
    assert (tmp_path / "product-pictures/tenants/t/product_images/image.webp").read_bytes() == b"image-bytes"
