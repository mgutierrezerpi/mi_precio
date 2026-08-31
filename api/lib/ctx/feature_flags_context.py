"""Feature flag definitions, evaluation, and tenant assignments."""

from openfeature import api as openfeature
from openfeature.evaluation_context import EvaluationContext
from peewee import PeeweeException

from lib.feature_flags import DatabaseFeatureProvider
from models import FeatureFlag, FeatureFlagAssignment, Tenant

MAGAZINES_FLAG = "magazines"

_KNOWN_FLAGS = {
    MAGAZINES_FLAG: "Revistas editoriales para negocios seleccionados.",
}

openfeature.set_provider(DatabaseFeatureProvider())
_client = openfeature.get_client("mi-precio")


def ensure_defaults() -> None:
    for key, description in _KNOWN_FLAGS.items():
        FeatureFlag.get_or_create(
            key=key,
            defaults={"description": description, "default_enabled": False},
        )


def is_enabled(key: str, tenant_id: str | None, default: bool = False) -> bool:
    """Evaluate a flag for one tenant, failing closed if storage is unavailable."""
    try:
        ensure_defaults()
        context = EvaluationContext(
            targeting_key=str(tenant_id) if tenant_id else None,
            attributes={"tenant_id": str(tenant_id)} if tenant_id else {},
        )
        return bool(_client.get_boolean_value(key, default, context))
    except PeeweeException:
        return default


def magazines_enabled(tenant_id: str | None) -> bool:
    return is_enabled(MAGAZINES_FLAG, tenant_id)


def all_for_tenant(tenant_id: str | None) -> dict[str, bool]:
    try:
        ensure_defaults()
        return {
            flag.key: is_enabled(flag.key, tenant_id, bool(flag.default_enabled))
            for flag in FeatureFlag.select().order_by(FeatureFlag.key.asc())
        }
    except PeeweeException:
        return {key: False for key in _KNOWN_FLAGS}


def list_flags() -> list[dict[str, object]]:
    ensure_defaults()
    tenants = list(Tenant.select().order_by(Tenant.name.asc()))
    result = []
    for flag in FeatureFlag.select().order_by(FeatureFlag.key.asc()):
        assignments = {
            assignment.tenant_id: bool(assignment.enabled)
            for assignment in FeatureFlagAssignment.select().where(
                FeatureFlagAssignment.flag == flag.id
            )
        }
        result.append(
            {
                "key": flag.key,
                "description": flag.description,
                "default_enabled": bool(flag.default_enabled),
                "tenants": [
                    {
                        "id": tenant.id,
                        "name": tenant.name,
                        "subdomain": tenant.subdomain,
                        "enabled": assignments.get(
                            tenant.id, bool(flag.default_enabled)
                        ),
                        "has_override": tenant.id in assignments,
                    }
                    for tenant in tenants
                ],
            }
        )
    return result


def set_tenant_flag(key: str, tenant_id: str, enabled: bool) -> dict[str, object] | None:
    ensure_defaults()
    flag = FeatureFlag.get_or_none(FeatureFlag.key == key)
    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    if not flag or not tenant:
        return None
    assignment, _ = FeatureFlagAssignment.get_or_create(
        flag=flag, tenant=tenant, defaults={"enabled": enabled}
    )
    if bool(assignment.enabled) != enabled:
        assignment.enabled = enabled
        assignment.save()
    return {
        "key": flag.key,
        "tenant_id": tenant.id,
        "enabled": bool(assignment.enabled),
    }
