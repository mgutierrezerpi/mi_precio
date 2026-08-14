import pytest
from fastapi import HTTPException

from controllers.deps import require_super_admin
from models import Tenant, User


def test_developer_portal_requires_platform_super_admin(db):
    tenant = Tenant.create(name="Shop", subdomain="shop")
    user = User.create(email="owner@shop.test", tenant=tenant, role="owner")

    with pytest.raises(HTTPException) as error:
        require_super_admin({"sub": str(user.id)})

    assert error.value.status_code == 403
    assert error.value.detail == "Super admin access required"


def test_developer_portal_allows_platform_super_admin(db):
    tenant = Tenant.create(name="Platform", subdomain="platform")
    user = User.create(
        email="developer@platform.test",
        tenant=tenant,
        role="viewer",
        is_super_admin=True,
    )

    assert require_super_admin({"sub": str(user.id)}) == {"sub": str(user.id)}
