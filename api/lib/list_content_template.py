"""Validation for template-specific public-list content overrides."""

from typing import Any


def validate_template(template: Any) -> None:
    """Template-specific editorial overrides. The renderer decides which apply."""
    if template is None:
        return
    allowed = {
        "font",
        "image",
        "image_label",
        "image_title",
        "promo_eyebrow",
        "promo_title",
        "promo_body",
        "promo_price",
        "promo_note",
        "footer_left",
        "footer_right",
        "checkout_channel",
        "instagram_handle",
        "price_format",
        "logo",
        "profile_name",
        "profile_image",
        "story_videos",
        "story_metrics",
        "film_images",
        "collaboration_heading",
        "stories_heading",
    }
    if not isinstance(template, dict) or set(template) - allowed:
        raise ValueError("content.template has unknown fields")
    if "font" in template and template["font"] not in {
        "sans",
        "editorial",
        "serif",
        "mono",
        "code-pro",
    }:
        raise ValueError("content.template.font is not supported")
    if "checkout_channel" in template and template["checkout_channel"] not in {
        "whatsapp",
        "instagram",
    }:
        raise ValueError("content.template.checkout_channel is not supported")
    if "price_format" in template and template["price_format"] not in {
        "$",
        "U$D",
        "USD",
    }:
        raise ValueError("content.template.price_format is not supported")
    if "story_videos" in template:
        if (
            not isinstance(template["story_videos"], list)
            or len(template["story_videos"]) > 6
        ):
            raise ValueError("content.template.story_videos must have at most 6 videos")
        for video in template["story_videos"]:
            _string(video, "content.template.story_videos entry")
    if "story_metrics" in template:
        if (
            not isinstance(template["story_metrics"], list)
            or len(template["story_metrics"]) > 6
        ):
            raise ValueError(
                "content.template.story_metrics must have at most 6 entries"
            )
        for metric in template["story_metrics"]:
            if not isinstance(metric, dict) or set(metric) != {
                "views",
                "likes",
                "comments",
            }:
                raise ValueError("each story metric needs views, likes, and comments")
            for value in metric.values():
                _string(value, "story metric value")
    if "film_images" in template:
        if (
            not isinstance(template["film_images"], list)
            or len(template["film_images"]) > 8
        ):
            raise ValueError("content.template.film_images must have at most 8 images")
        for image in template["film_images"]:
            _string(image, "content.template.film_images entry")
    for key, value in template.items():
        if key not in {
            "font",
            "checkout_channel",
            "price_format",
            "story_videos",
            "story_metrics",
            "film_images",
        }:
            _string(value, f"content.template.{key}", allow_empty=True)


def _string(value: Any, label: str, *, allow_empty: bool = False) -> str:
    if not isinstance(value, str) or (not allow_empty and not value.strip()):
        raise ValueError(f"{label} must be a non-empty string")
    if len(value) > 2_000:
        raise ValueError(f"{label} is too long")
    return value
