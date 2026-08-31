"""Whole features a tier unlocks, as opposed to its numeric allowances."""

from lib.ctx import identity, plans
from lib.ctx.plans_context import PLAN_FEATURES, PLAN_ORDER, PLANS

_n = 0


def _tenant(plan="free"):
    # Subdomains are unique, so a test wanting two tenants needs two names —
    # create_tenant answers None on a collision rather than raising.
    global _n
    _n += 1
    tenant = identity.create_tenant(f"Store {_n}", f"store_{_n}")
    assert tenant is not None
    if plan != "free":
        plans.set_plan(tenant.id, plan)
    return tenant


class TestLeadsGating:
    def test_leads_belongs_to_the_two_paid_tiers(self, db):
        assert plans.has_feature(_tenant("plus").id, "leads")
        assert plans.has_feature(_tenant("pro").id, "leads")

    def test_the_cheaper_tiers_do_not_have_it(self, db):
        assert not plans.has_feature(_tenant("micro").id, "leads")
        assert not plans.has_feature(_tenant("free").id, "leads")

    def test_an_unknown_feature_is_never_granted(self, db):
        assert not plans.has_feature(_tenant("pro").id, "telepathy")

    def test_a_missing_tenant_gets_nothing(self, db):
        assert not plans.has_feature("does-not-exist", "leads")

    def test_an_expired_subscription_takes_the_feature_with_it(self, db):
        # Same rule as the storefront: a plan that is required means the paid
        # features are gone, not that they quietly fall back to free.
        tenant = _tenant("pro")
        tenant.plan = "free"
        tenant.plan_gate = True
        tenant.save()

        assert plans.plan_required(tenant.id)
        assert not plans.has_feature(tenant.id, "leads")


class TestShape:
    def test_every_plan_declares_its_features(self, db):
        # A tier missing from the map would raise a KeyError on the plan screen.
        assert set(PLAN_FEATURES) == set(PLANS) == set(PLAN_ORDER)

    def test_plan_info_reports_them_for_the_billing_screen(self, db):
        info = plans.plan_info(_tenant("plus").id)

        assert info["features"] == ["leads"]
        assert plans.plan_info(_tenant("micro").id)["features"] == []
