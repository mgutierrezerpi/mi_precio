"""Social links: whatever a shop pastes has to end up openable, or be rejected."""

import pytest
from pydantic import ValidationError

from controllers.input_types import UpdateTenant
from controllers.input_types.socials import normalize_social_url, normalize_whatsapp


class TestHandles:
    """Shops type what they know: usually the @handle, not the profile URL."""

    def test_bare_handle_becomes_a_profile_url(self):
        assert normalize_social_url("micafe", "instagram") == "https://instagram.com/micafe"

    def test_leading_at_is_dropped(self):
        assert normalize_social_url("@micafe", "instagram") == "https://instagram.com/micafe"

    def test_tiktok_keeps_the_at_its_urls_require(self):
        assert normalize_social_url("@micafe", "tiktok") == "https://tiktok.com/@micafe"

    def test_a_handle_is_not_a_handle_on_a_network_without_a_known_shape(self):
        # There is no canonical "website handle", so it is read as a hostname.
        assert normalize_social_url("micafe.uy", "website") == "https://micafe.uy"


class TestUrls:
    def test_a_full_url_is_left_alone(self):
        url = "https://instagram.com/micafe"
        assert normalize_social_url(url, "instagram") == url

    def test_http_is_not_upgraded_behind_the_shops_back(self):
        assert normalize_social_url("http://micafe.uy", "website") == "http://micafe.uy"

    def test_a_missing_scheme_is_assumed_rather_than_dropped(self):
        assert (
            normalize_social_url("instagram.com/micafe", "instagram")
            == "https://instagram.com/micafe"
        )

    def test_www_is_a_url_not_a_handle(self):
        assert normalize_social_url("www.micafe.uy", "website") == "https://www.micafe.uy"

    def test_surrounding_whitespace_is_forgiven(self):
        assert (
            normalize_social_url("  instagram.com/micafe  ", "instagram")
            == "https://instagram.com/micafe"
        )


class TestEmptyAndHostile:
    @pytest.mark.parametrize("value", [None, "", "   ", "@"])
    def test_empty_means_the_shop_does_not_use_this_network(self, value):
        assert normalize_social_url(value, "instagram") is None

    def test_a_script_url_is_rejected_not_prefixed_into_looking_valid(self):
        # Prefixing turns this into "https://javascript:alert(1)", which must
        # not pass as a link we render into the public footer.
        with pytest.raises(ValueError):
            normalize_social_url("javascript:alert(1)", "website")

    def test_something_with_no_host_is_rejected(self):
        with pytest.raises(ValueError):
            normalize_social_url("https://", "website")

    def test_an_overlong_link_is_rejected(self):
        with pytest.raises(ValueError):
            normalize_social_url("https://micafe.uy/" + "x" * 600, "website")


class TestWhatsapp:
    """Stored as digits: shops know their number, not their wa.me URL."""

    def test_punctuation_and_spaces_are_stripped(self):
        assert normalize_whatsapp("+598 99 123 456") == "59899123456"

    def test_written_out_international_prefix_is_dropped(self):
        # 00 and + mean the same thing; wa.me wants neither.
        assert normalize_whatsapp("0059899123456") == "59899123456"

    def test_plain_digits_survive(self):
        assert normalize_whatsapp("59899123456") == "59899123456"

    @pytest.mark.parametrize("value", [None, "", "   ", "+", "-- --"])
    def test_no_digits_means_no_whatsapp(self, value):
        assert normalize_whatsapp(value) is None

    @pytest.mark.parametrize("value", ["12345", "1" * 16])
    def test_implausible_lengths_are_rejected(self, value):
        with pytest.raises(ValueError):
            normalize_whatsapp(value)


class TestThroughUpdateTenant:
    def test_the_validators_are_wired_to_the_fields(self):
        payload = UpdateTenant(
            social_instagram="@micafe",
            social_facebook="micafe",
            social_tiktok="micafe",
            social_website="micafe.uy",
            social_whatsapp="+598 99 123 456",
        )

        assert payload.social_instagram == "https://instagram.com/micafe"
        assert payload.social_facebook == "https://facebook.com/micafe"
        assert payload.social_tiktok == "https://tiktok.com/@micafe"
        assert payload.social_website == "https://micafe.uy"
        assert payload.social_whatsapp == "59899123456"

    def test_omitting_them_leaves_them_untouched(self):
        assert UpdateTenant(name="Mi Cafe").social_instagram is None

    def test_a_bad_link_fails_the_request_rather_than_being_stored(self):
        with pytest.raises(ValidationError):
            UpdateTenant(social_website="javascript:alert(1)")
