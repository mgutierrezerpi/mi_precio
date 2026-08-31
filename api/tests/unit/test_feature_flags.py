from lib.ctx import feature_flags, identity, magazines


def test_known_flags_are_disabled_by_default(db):
    tenant = identity.create_tenant("Journal Store", "journal-store")

    assert feature_flags.magazines_enabled(tenant.id) is False
    assert feature_flags.all_for_tenant(tenant.id) == {"magazines": False}


def test_feature_flags_can_be_enabled_for_one_tenant_only(db):
    enabled_tenant = identity.create_tenant("Enabled Store", "enabled-store")
    disabled_tenant = identity.create_tenant("Disabled Store", "disabled-store")

    feature_flags.set_tenant_flag("magazines", enabled_tenant.id, True)

    assert feature_flags.magazines_enabled(enabled_tenant.id) is True
    assert feature_flags.magazines_enabled(disabled_tenant.id) is False


def test_magazine_data_remains_separate_while_public_access_is_flagged(db):
    tenant = identity.create_tenant("Journal Store", "journal-store")
    magazine = magazines.create_magazine(
        tenant.id, name="Autumn Journal", published=True
    )

    assert magazine is not None
    assert feature_flags.magazines_enabled(tenant.id) is False

    feature_flags.set_tenant_flag("magazines", tenant.id, True)

    assert feature_flags.magazines_enabled(tenant.id) is True
