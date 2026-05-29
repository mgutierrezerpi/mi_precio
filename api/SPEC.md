# Mi Precio API Specification

## Overview

FastAPI-based JSON API backend following **Clean Architecture** with **Domain-Driven Design** principles, adapted for a lightweight SQLite-backed application.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | FastAPI |
| ORM | Peewee (lightweight, SQLite-optimized) |
| Database | SQLite (dev & prod) |
| Migrations | peewee-migrate |
| Validation | Pydantic v2 |
| Auth | JWT tokens |
| Testing | PyTest |
| Linting | Ruff |
| Type Checking | MyPy |

### Why Peewee for SQLite?

- **Designed for SQLite**: Peewee was built with SQLite as a first-class citizen
- **Lightweight**: ~7k lines of code, minimal overhead
- **Simple API**: Pythonic, expressive query syntax
- **Excellent SQLite features**: Full-text search, JSON fields, WAL mode support

---

## Architecture: Clean Architecture + DDD

```
┌─────────────────────────────────────────────────────────────┐
│                    Interface Layer                          │
│              (Controllers, Routes, Serializers)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│                (Use Cases / Application Services)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│        (Entities, Value Objects, Domain Services)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│           (Repositories, Database, External APIs)           │
└─────────────────────────────────────────────────────────────┘
```

**Dependency Rule**: Dependencies point inward. Domain has no dependencies. Infrastructure depends on Domain.

**Where Logic Lives**:
| Type | Location |
|------|----------|
| Business rules | Domain entities |
| Validation | Value objects |
| Orchestration | Use cases |
| External APIs | Infrastructure services |
| Data persistence | Repositories |

---

## Directory Structure

```
api/
├── app.py                          # FastAPI app factory
├── routes.py                       # Route registration (centralized)
├── config.py                       # Environment configuration
├── requirements.txt
├── .env.example
│
├── domain/                         # DOMAIN LAYER (pure business logic)
│   ├── __init__.py
│   ├── entities/                   # Core business objects (with behavior)
│   │   ├── __init__.py
│   │   ├── tenant.py               # Tenant (restaurant) entity
│   │   ├── user.py                 # User entity
│   │   ├── list.py                 # List (menu/price list) entity
│   │   ├── list_version.py         # ListVersion entity
│   │   └── item.py                 # Item (menu item) entity
│   ├── value_objects/              # Immutable domain concepts
│   │   ├── __init__.py
│   │   ├── money.py                # Money value object (price)
│   │   ├── email.py                # Email value object
│   │   └── subdomain.py            # Subdomain value object
│   └── repositories/               # Repository interfaces (abstractions)
│       ├── __init__.py
│       ├── tenant_repository.py
│       ├── user_repository.py
│       ├── list_repository.py
│       ├── list_version_repository.py
│       └── item_repository.py
│
├── application/                    # APPLICATION LAYER (use cases)
│   ├── __init__.py
│   ├── use_cases/                  # Application services
│   │   ├── __init__.py
│   │   ├── tenants/
│   │   │   ├── create_tenant.py
│   │   │   ├── get_tenant.py
│   │   │   └── list_tenants.py
│   │   ├── lists/
│   │   │   ├── create_list.py
│   │   │   ├── get_list.py
│   │   │   ├── list_lists.py
│   │   │   ├── publish_list.py
│   │   │   └── set_index_list.py
│   │   ├── versions/
│   │   │   ├── create_version.py
│   │   │   ├── publish_version.py
│   │   │   └── duplicate_version.py
│   │   ├── items/
│   │   │   ├── create_item.py
│   │   │   ├── update_item.py
│   │   │   ├── delete_item.py
│   │   │   └── reorder_items.py
│   │   └── public/
│   │       └── get_public_menu.py
│   └── dto/                        # Data Transfer Objects
│       ├── __init__.py
│       ├── tenant_dto.py
│       ├── list_dto.py
│       ├── version_dto.py
│       └── item_dto.py
│
├── infrastructure/                 # INFRASTRUCTURE LAYER
│   ├── __init__.py
│   ├── database/
│   │   ├── __init__.py
│   │   ├── connection.py           # Peewee database setup
│   │   └── models/                 # Peewee ORM models
│   │       ├── __init__.py
│   │       ├── base.py
│   │       ├── tenant_model.py
│   │       ├── user_model.py
│   │       ├── list_model.py
│   │       ├── list_version_model.py
│   │       └── item_model.py
│   ├── repositories/               # Concrete repository implementations
│   │   ├── __init__.py
│   │   ├── peewee_tenant_repository.py
│   │   ├── peewee_user_repository.py
│   │   ├── peewee_list_repository.py
│   │   ├── peewee_list_version_repository.py
│   │   └── peewee_item_repository.py
│   └── services/                   # External integrations ONLY
│       ├── __init__.py
│       └── storage_service.py      # Image storage (future)
│
├── interface/                      # INTERFACE LAYER (HTTP)
│   ├── __init__.py
│   ├── controllers/                # Request handlers
│   │   ├── __init__.py
│   │   ├── health_controller.py
│   │   ├── auth_controller.py
│   │   ├── tenants_controller.py
│   │   ├── lists_controller.py
│   │   ├── versions_controller.py
│   │   ├── items_controller.py
│   │   └── public_controller.py
│   └── serializers/                # Response formatting
│       ├── __init__.py
│       ├── tenant_serializer.py
│       ├── list_serializer.py
│       ├── version_serializer.py
│       └── item_serializer.py
│
├── lib/                            # Shared utilities
│   ├── __init__.py
│   ├── exceptions.py               # Custom exceptions
│   └── dependency_injection.py     # DI container setup
│
├── db/
│   ├── migrations/
│   └── seed.py
│
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── unit/                       # Domain & use case tests
    │   ├── domain/
    │   └── application/
    └── integration/                # Repository & API tests
        ├── infrastructure/
        └── interface/
```

---

## Layer Details

### 1. Domain Layer (Core Business Logic)

The domain layer is **framework-agnostic** and contains no dependencies on Peewee, FastAPI, or external libraries.

#### Entities (Rich Domain Models)

Business logic lives in entities. They are not anemic data containers.

```python
# domain/entities/product.py
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from domain.value_objects.sku import SKU
from domain.value_objects.money import Money

@dataclass
class Product:
    id: int | None
    name: str
    description: str | None
    sku: SKU
    created_at: datetime
    updated_at: datetime

    def update(self, name: str | None = None, description: str | None = None) -> None:
        if name is not None:
            self.name = name
        if description is not None:
            self.description = description
        self.updated_at = datetime.utcnow()


# domain/entities/price.py
@dataclass
class Price:
    id: int | None
    product_id: int
    cost: Money
    selling_price: Money
    created_at: datetime

    def margin(self) -> Decimal:
        """Calculate profit margin percentage. Business logic in entity."""
        if self.cost.amount == 0:
            return Decimal(0)
        return ((self.selling_price.amount - self.cost.amount) / self.cost.amount) * 100

    def is_profitable(self) -> bool:
        """Check if price generates profit."""
        return self.selling_price.amount > self.cost.amount
```

#### Value Objects

```python
# domain/value_objects/money.py
from dataclasses import dataclass
from decimal import Decimal

@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str = "ARS"

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("Money amount cannot be negative")

    def add(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("Cannot add different currencies")
        return Money(self.amount + other.amount, self.currency)

# domain/value_objects/sku.py
from dataclasses import dataclass
import re

@dataclass(frozen=True)
class SKU:
    value: str

    def __post_init__(self):
        if not re.match(r'^[A-Z0-9-]+$', self.value):
            raise ValueError(f"Invalid SKU format: {self.value}")
```

#### Repository Interfaces (Abstractions)

```python
# domain/repositories/product_repository.py
from abc import ABC, abstractmethod
from domain.entities.product import Product

class ProductRepository(ABC):
    @abstractmethod
    def get_by_id(self, product_id: int) -> Product | None:
        pass

    @abstractmethod
    def get_by_sku(self, sku: str) -> Product | None:
        pass

    @abstractmethod
    def get_all(self) -> list[Product]:
        pass

    @abstractmethod
    def save(self, product: Product) -> Product:
        pass

    @abstractmethod
    def delete(self, product_id: int) -> None:
        pass
```

---

### 2. Application Layer (Use Cases)

Orchestrates domain logic to fulfill specific application requirements.

```python
# application/use_cases/products/create_product.py
from dataclasses import dataclass
from datetime import datetime
from domain.entities.product import Product
from domain.repositories.product_repository import ProductRepository
from domain.value_objects.sku import SKU
from application.dto.product_dto import CreateProductDTO
from lib.exceptions import ConflictError

@dataclass
class CreateProductUseCase:
    product_repository: ProductRepository

    def execute(self, dto: CreateProductDTO) -> Product:
        # Validate SKU doesn't exist
        existing = self.product_repository.get_by_sku(dto.sku)
        if existing:
            raise ConflictError(f"Product with SKU {dto.sku} already exists")

        # Create domain entity
        product = Product(
            id=None,
            name=dto.name,
            description=dto.description,
            sku=SKU(dto.sku),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        # Persist and return
        return self.product_repository.save(product)
```

#### DTOs (Data Transfer Objects)

```python
# application/dto/product_dto.py
from pydantic import BaseModel, Field

class CreateProductDTO(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    sku: str = Field(..., pattern=r'^[A-Z0-9-]+$')

class UpdateProductDTO(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
```

---

### 3. Infrastructure Layer

Implements interfaces defined in the domain layer.

#### Database Connection

```python
# infrastructure/database/connection.py
from peewee import SqliteDatabase
from playhouse.sqlite_ext import SqliteExtDatabase
from config import settings

db = SqliteExtDatabase(
    settings.database_path,
    pragmas={
        'journal_mode': 'wal',
        'cache_size': -64 * 1000,
        'foreign_keys': 1,
        'synchronous': 'normal',
    }
)
```

#### ORM Models (Persistence)

```python
# infrastructure/database/models/product_model.py
from peewee import CharField, TextField, DateTimeField, AutoField
from infrastructure.database.models.base import BaseModel

class ProductModel(BaseModel):
    id = AutoField()
    name = CharField(index=True)
    description = TextField(null=True)
    sku = CharField(unique=True, index=True)
    created_at = DateTimeField()
    updated_at = DateTimeField()

    class Meta:
        table_name = "products"
```

#### External Services (Infrastructure Only)

Services are **only for external integrations** (APIs, email providers, storage, etc.). Business logic belongs in entities and use cases.

```python
# infrastructure/services/email_service.py
from abc import ABC, abstractmethod

class EmailService(ABC):
    @abstractmethod
    def send(self, to: str, subject: str, body: str) -> bool:
        pass

class SendGridEmailService(EmailService):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def send(self, to: str, subject: str, body: str) -> bool:
        # SendGrid API integration
        ...
```

#### Repository Implementation

```python
# infrastructure/repositories/peewee_product_repository.py
from domain.entities.product import Product
from domain.repositories.product_repository import ProductRepository
from domain.value_objects.sku import SKU
from infrastructure.database.models.product_model import ProductModel

class PeeweeProductRepository(ProductRepository):
    def get_by_id(self, product_id: int) -> Product | None:
        model = ProductModel.get_or_none(ProductModel.id == product_id)
        return self._to_entity(model) if model else None

    def get_by_sku(self, sku: str) -> Product | None:
        model = ProductModel.get_or_none(ProductModel.sku == sku)
        return self._to_entity(model) if model else None

    def get_all(self) -> list[Product]:
        return [self._to_entity(m) for m in ProductModel.select()]

    def save(self, product: Product) -> Product:
        if product.id is None:
            model = ProductModel.create(
                name=product.name,
                description=product.description,
                sku=product.sku.value,
                created_at=product.created_at,
                updated_at=product.updated_at,
            )
            product.id = model.id
        else:
            ProductModel.update(
                name=product.name,
                description=product.description,
                updated_at=product.updated_at,
            ).where(ProductModel.id == product.id).execute()
        return product

    def delete(self, product_id: int) -> None:
        ProductModel.delete().where(ProductModel.id == product_id).execute()

    def _to_entity(self, model: ProductModel) -> Product:
        return Product(
            id=model.id,
            name=model.name,
            description=model.description,
            sku=SKU(model.sku),
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
```

---

### 4. Interface Layer (HTTP)

Handles HTTP concerns and delegates to use cases.

#### Controllers

```python
# interface/controllers/products_controller.py
from application.use_cases.products.create_product import CreateProductUseCase
from application.use_cases.products.list_products import ListProductsUseCase
from application.dto.product_dto import CreateProductDTO
from interface.serializers.product_serializer import ProductSerializer

class ProductsController:
    def __init__(self, create_use_case: CreateProductUseCase, list_use_case: ListProductsUseCase):
        self.create_use_case = create_use_case
        self.list_use_case = list_use_case

    def index(self) -> list[dict]:
        products = self.list_use_case.execute()
        return [ProductSerializer.serialize(p) for p in products]

    def create(self, data: CreateProductDTO) -> dict:
        product = self.create_use_case.execute(data)
        return ProductSerializer.serialize(product)
```

#### Serializers

```python
# interface/serializers/product_serializer.py
from domain.entities.product import Product

class ProductSerializer:
    @staticmethod
    def serialize(product: Product) -> dict:
        return {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "sku": product.sku.value,
            "created_at": product.created_at.isoformat(),
            "updated_at": product.updated_at.isoformat(),
        }
```

#### Routes

```python
# routes.py
from fastapi import APIRouter, Depends
from lib.dependency_injection import get_products_controller
from application.dto.product_dto import CreateProductDTO

def register_routes(app):
    api = APIRouter(prefix="/api/v1")

    @api.get("/products")
    def list_products(controller=Depends(get_products_controller)):
        return controller.index()

    @api.post("/products", status_code=201)
    def create_product(data: CreateProductDTO, controller=Depends(get_products_controller)):
        return controller.create(data)

    @api.get("/products/{product_id}")
    def get_product(product_id: int, controller=Depends(get_products_controller)):
        return controller.show(product_id)

    app.include_router(api)
```

---

## Dependency Injection

```python
# lib/dependency_injection.py
from infrastructure.repositories.peewee_product_repository import PeeweeProductRepository
from application.use_cases.products.create_product import CreateProductUseCase
from application.use_cases.products.list_products import ListProductsUseCase
from interface.controllers.products_controller import ProductsController

def get_products_controller() -> ProductsController:
    repo = PeeweeProductRepository()
    return ProductsController(
        create_use_case=CreateProductUseCase(product_repository=repo),
        list_use_case=ListProductsUseCase(product_repository=repo),
    )
```

---

## API Design

### Base URL
```
/api/v1
```

### Endpoints

#### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/logout` | User logout |
| GET | `/api/v1/auth/me` | Get current user |

#### Tenants (Super Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tenants` | List all tenants |
| POST | `/api/v1/tenants` | Create tenant |
| GET | `/api/v1/tenants/{id}` | Get tenant |
| PATCH | `/api/v1/tenants/{id}` | Update tenant |
| DELETE | `/api/v1/tenants/{id}` | Delete tenant |

#### Lists (Price Lists / Menus)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lists` | List all lists for tenant |
| POST | `/api/v1/lists` | Create list |
| GET | `/api/v1/lists/{id}` | Get list with current version |
| PATCH | `/api/v1/lists/{id}` | Update list |
| DELETE | `/api/v1/lists/{id}` | Delete list |
| POST | `/api/v1/lists/{id}/publish` | Publish list |
| POST | `/api/v1/lists/{id}/unpublish` | Unpublish list |
| POST | `/api/v1/lists/{id}/set-index` | Set as index list |

#### List Versions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lists/{list_id}/versions` | List all versions |
| POST | `/api/v1/lists/{list_id}/versions` | Create new version |
| GET | `/api/v1/lists/{list_id}/versions/{id}` | Get version with items |
| POST | `/api/v1/lists/{list_id}/versions/{id}/publish` | Publish version |
| POST | `/api/v1/lists/{list_id}/versions/{id}/duplicate` | Duplicate version |

#### Items (Menu Items)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/versions/{version_id}/items` | List items in version |
| POST | `/api/v1/versions/{version_id}/items` | Create item |
| GET | `/api/v1/items/{id}` | Get item |
| PATCH | `/api/v1/items/{id}` | Update item |
| DELETE | `/api/v1/items/{id}` | Delete item |
| POST | `/api/v1/items/{id}/move` | Reorder item position |

#### Public (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/public/{subdomain}` | Get tenant's public menu |
| GET | `/api/v1/public/{subdomain}/lists` | Get published lists |
| GET | `/api/v1/public/{subdomain}/lists/{id}` | Get published list with items |

### Response Format

**Success (single):**
```json
{
  "id": 1,
  "name": "Main Menu",
  "published": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Success (collection):**
```json
{
  "data": [...],
  "meta": {"total": 10, "page": 1, "per_page": 20}
}
```

**Error:**
```json
{
  "detail": "List not found",
  "code": "NOT_FOUND"
}
```

---

## Configuration

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Mi Precio API"
    debug: bool = False
    database_path: str = "db/mi_precio.db"
    secret_key: str
    cors_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## Testing Strategy

```
tests/
├── unit/                           # Fast, isolated tests
│   ├── domain/                     # Entity and value object tests
│   │   ├── test_product.py
│   │   └── test_money.py
│   └── application/                # Use case tests with mock repos
│       └── test_create_product.py
└── integration/                    # Tests with real database
    ├── infrastructure/             # Repository tests
    │   └── test_product_repository.py
    └── interface/                  # API endpoint tests
        └── test_products_api.py
```

---

## Development Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app:app --reload --port 8000

# Run tests
pytest

# Run unit tests only (fast)
pytest tests/unit

# Type checking
mypy .

# Linting
ruff check .
```

---

## Benefits of This Architecture

1. **Testability**: Domain logic can be tested without database or HTTP
2. **Flexibility**: Easy to swap SQLite for PostgreSQL (just new repository)
3. **Maintainability**: Clear boundaries between concerns
4. **Domain Focus**: Business logic is explicit and isolated
5. **Framework Independence**: Domain doesn't know about FastAPI or Peewee
