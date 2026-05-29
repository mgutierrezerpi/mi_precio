from datetime import datetime
from pathlib import Path
from uuid import uuid4
from peewee import Model, CharField, DateTimeField, SqliteDatabase
from config import settings

# Ensure database path is absolute (relative to api directory)
_db_path = settings.database_path
if not Path(_db_path).is_absolute():
    # api directory is parent of models directory
    _api_dir = Path(__file__).resolve().parent.parent
    _db_path = str(_api_dir / _db_path)

db = SqliteDatabase(_db_path)


def generate_uuid():
    """Generate UUID without hyphens."""
    return uuid4().hex


class BaseModel(Model):
    """Base model with common fields and behaviors."""

    id = CharField(primary_key=True, max_length=32, default=generate_uuid)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    class Meta:
        database = db

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = generate_uuid()
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)

    def duplicate(self, **overrides):
        """Create a copy of this instance with optional overrides."""
        data = {k: v for k, v in self.__data__.items() if k not in ("id", "created_at", "updated_at")}
        data.update(overrides)
        return self.__class__.create(**data)
