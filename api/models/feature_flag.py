from peewee import BooleanField, CharField, ForeignKeyField, TextField

from models.base import BaseModel
from models.tenant import Tenant


class FeatureFlag(BaseModel):
    """A platform feature that can be overridden for individual tenants."""

    key = CharField(max_length=128, unique=True)
    description = TextField(null=True)
    default_enabled = BooleanField(default=False)

    class Meta:
        table_name = "feature_flags"


class FeatureFlagAssignment(BaseModel):
    """A tenant-specific value for a feature flag."""

    flag = ForeignKeyField(FeatureFlag, backref="assignments", on_delete="CASCADE")
    tenant = ForeignKeyField(Tenant, backref="feature_flag_assignments", on_delete="CASCADE")
    enabled = BooleanField(default=False)

    class Meta:
        table_name = "feature_flag_assignments"
        indexes = ((('flag', 'tenant'), True),)
