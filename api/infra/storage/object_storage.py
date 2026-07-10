from io import BytesIO
from pathlib import Path, PurePosixPath
from typing import Any

from config import settings


class ObjectStorageError(Exception):
    pass


class ObjectStorage:
    def __init__(self) -> None:
        self._client: Any | None = None

    def upload(self, key: str, body: bytes, content_type: str) -> str:
        if self._local_configured:
            self._write_local(key, body)
            return self.public_url_for(key)

        if not self._s3_configured:
            raise ObjectStorageError("Storage is not configured")

        try:
            self._get_client().upload_fileobj(
                BytesIO(body),
                settings.storage_bucket,
                key,
                ExtraArgs={"ContentType": content_type},
            )
        except Exception as e:
            raise ObjectStorageError(f"Failed to upload object: {e}") from e

        return self.public_url_for(key)

    def public_url_for(self, key: str) -> str:
        base_url = settings.storage_public_url.rstrip("/")
        return f"{base_url}/{settings.storage_bucket}/{key}"

    @property
    def _s3_configured(self) -> bool:
        return all([
            settings.storage_endpoint_url,
            settings.storage_public_url,
            settings.storage_bucket,
            settings.storage_access_key,
            settings.storage_secret_key,
        ])

    @property
    def _local_configured(self) -> bool:
        return bool(settings.storage_local_path and settings.storage_public_url and settings.storage_bucket)

    def _write_local(self, key: str, body: bytes) -> None:
        path = PurePosixPath(key)
        if path.is_absolute() or ".." in path.parts:
            raise ObjectStorageError("Invalid object key")

        try:
            target = Path(settings.storage_local_path) / settings.storage_bucket / Path(*path.parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(body)
        except Exception as e:
            raise ObjectStorageError(f"Failed to write object: {e}") from e

    def _get_client(self) -> Any:
        if self._client is None:
            import boto3
            from botocore.config import Config

            self._client = boto3.client(
                "s3",
                endpoint_url=settings.storage_endpoint_url,
                aws_access_key_id=settings.storage_access_key,
                aws_secret_access_key=settings.storage_secret_key,
                config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
            )

        return self._client


object_storage = ObjectStorage()
