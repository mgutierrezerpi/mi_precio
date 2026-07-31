"""Per-list appearance overrides: a list customizes what it sets and inherits the rest."""

import pytest

from controllers.input_types import UpdateList
from lib.ctx import lists, identity


def _list(name="Menu"):
    tenant = identity.create_tenant("Test Store", "test_store")
    return lists.create_list(tenant.id, name).price_list


def test_new_list_inherits_everything(db):
    price_list = _list()

    assert price_list.design is None
    assert price_list.hero_color is None
    assert price_list.bg_url is None
    assert price_list.bg_overlay is None


def test_update_sets_only_the_given_overrides(db):
    price_list = _list()

    updated = lists.update_list(price_list.id, design="fine", hero_color="#B45309")

    assert updated.design == "fine"
    assert updated.hero_color == "#B45309"
    # Untouched fields keep inheriting.
    assert updated.bg_url is None


def test_null_clears_an_override_back_to_inheriting(db):
    price_list = _list()
    lists.update_list(price_list.id, design="fine", bg_url="data:image/png;base64,x")

    updated = lists.update_list(price_list.id, design=None, bg_url=None)

    assert updated.design is None
    assert updated.bg_url is None


def test_null_does_not_blank_the_non_appearance_fields(db):
    price_list = _list("Mayorista")

    updated = lists.update_list(price_list.id, name=None, design="tech")

    assert updated.name == "Mayorista"
    assert updated.design == "tech"


def test_design_must_be_a_known_template(db):
    with pytest.raises(ValueError):
        UpdateList(design="not-a-design")


def test_hero_color_must_be_hex(db):
    with pytest.raises(ValueError):
        UpdateList(hero_color="red")

    assert UpdateList(hero_color="#b45309").hero_color == "#B45309"
    # Empty string means "no override", same as null.
    assert UpdateList(hero_color="").hero_color is None
