"""OpenFeature provider backed by MiPrecio's tenant-scoped assignments."""

from typing import Any

from openfeature.evaluation_context import EvaluationContext
from openfeature.flag_evaluation import FlagResolutionDetails, Reason
from openfeature.provider import Metadata
from openfeature.provider.in_memory_provider import InMemoryProvider

from models import FeatureFlag, FeatureFlagAssignment


class DatabaseFeatureProvider(InMemoryProvider):
    """Resolve boolean flags from the local database.

    OpenFeature gives the application a stable evaluation API while the source
    of truth stays local and tenant-specific. Other flag value types retain the
    SDK's in-memory provider behavior and are intentionally unused for now.
    """

    def __init__(self) -> None:
        super().__init__({})

    def get_metadata(self) -> Metadata:
        return Metadata(name="MiPrecio database feature flags")

    def resolve_boolean_details(
        self,
        flag_key: str,
        default_value: bool,
        evaluation_context: EvaluationContext | None = None,
    ) -> FlagResolutionDetails[bool]:
        flag = FeatureFlag.get_or_none(FeatureFlag.key == flag_key)
        if not flag:
            return FlagResolutionDetails(value=default_value, reason=Reason.DEFAULT)

        tenant_id = _tenant_id(evaluation_context)
        assignment = None
        if tenant_id:
            assignment = FeatureFlagAssignment.get_or_none(
                (FeatureFlagAssignment.flag == flag.id)
                & (FeatureFlagAssignment.tenant == tenant_id)
            )

        if assignment is not None:
            return FlagResolutionDetails(
                value=bool(assignment.enabled),
                reason=Reason.TARGETING_MATCH,
                variant="tenant-enabled" if assignment.enabled else "tenant-disabled",
            )
        return FlagResolutionDetails(
            value=bool(flag.default_enabled),
            reason=Reason.STATIC,
            variant="default-enabled" if flag.default_enabled else "default-disabled",
        )


def _tenant_id(context: EvaluationContext | None) -> str | None:
    if not context:
        return None
    value: Any = context.attributes.get("tenant_id")
    if value is None:
        value = context.targeting_key
    return str(value) if value else None
