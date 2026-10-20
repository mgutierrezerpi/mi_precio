"""A Linktree link can not take another business's (R6)."""

import pytest

from lib.ctx import identity, linktrees


def test_another_linktree_link_is_refused_not_a_500(db):
    cafe = identity.create_tenant("Café", "cafe-r6")
    otro = identity.create_tenant("Otro", "otro-r6")
    linktrees.get_linktree(otro.id)
    tree = linktrees.get_linktree(cafe.id)

    with pytest.raises(linktrees.SlugTaken):
        linktrees.update_linktree(tree.id, public_slug="otro-r6")


def test_another_business_address_is_refused(db):
    cafe = identity.create_tenant("Café", "cafe-r6b")
    identity.create_tenant("Kiosco", "kiosco-r6b")
    tree = linktrees.get_linktree(cafe.id)

    with pytest.raises(linktrees.SlugTaken):
        linktrees.update_linktree(tree.id, public_slug="kiosco-r6b")


def test_own_address_and_free_links_still_work(db):
    cafe = identity.create_tenant("Café", "cafe-r6c")
    tree = linktrees.get_linktree(cafe.id)
    assert (
        linktrees.update_linktree(tree.id, public_slug="cafe-r6c").public_slug
        == "cafe-r6c"
    )
    assert (
        linktrees.update_linktree(tree.id, public_slug="mi-cafe").public_slug
        == "mi-cafe"
    )


def test_a_business_whose_address_was_taken_still_gets_a_linktree(db):
    cafe = identity.create_tenant("Café", "cafe-r6d")
    kiosco = identity.create_tenant("Kiosco", "kiosco-r6d")
    tree = linktrees.get_linktree(cafe.id)
    tree.public_slug = "kiosco-r6d"  # taken before the check existed
    tree.save()

    assert linktrees.get_linktree(kiosco.id).public_slug == "kiosco-r6d-2"
