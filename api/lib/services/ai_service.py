"""AI service for extracting menu items from business URLs and images."""

import logging

from openai import OpenAI

from config import settings
from lib.services.ai_url_classification import is_google_maps_url
from lib.services.google_listing_capture import capture_google_listing
from lib.services.menu_ai_provider import extract_from_text, extract_with_vision
from lib.services.menu_extraction_types import MenuItem
from lib.services.menu_price import parse_price
from lib.services.menu_web_fetch import extract_image_urls, fetch_page

logger = logging.getLogger(__name__)
def extract_menu_items(url: str) -> list[MenuItem]:
    """
    Extract menu items from a business URL (Google Maps, website, etc).

    Uses GPT-4o vision to analyze menu images and extract structured data.
    For Google Maps URLs, uses Outscraper API to fetch place data and photos.
    Falls back to text extraction if no images are found.
    """
    logger.info(f"[Extract] Starting menu extraction for: {url}")

    if not settings.openai_api_key:
        raise ValueError("OpenAI API key not configured")

    client = OpenAI(api_key=settings.openai_api_key)

    items_data = []
    text_content = ""
    image_data_list = []

    # Check if it's a Google Maps/Search URL - use Outscraper
    if is_google_maps_url(url):
        logger.info("[Extract] Detected Google Maps URL, using Outscraper")
        items_data = capture_google_listing(url, client)
    else:
        # Regular website - use simple HTTP fetch
        logger.info("[Extract] Regular URL, using HTTP fetch")
        html, text_content = fetch_page(url)
        image_urls = extract_image_urls(html, url)
        logger.info(f"[Extract] Found {len(image_urls)} images in page")

        for img_url in image_urls[:5]:
            if img_url.startswith("data:"):
                image_data_list.append(img_url)
            else:
                image_data_list.append(img_url)

    # Use vision to extract menu items from images/screenshots
    if image_data_list:
        logger.info(f"[Extract] Processing {len(image_data_list)} images with vision")
        items_data = extract_with_vision(client, image_data_list[:5], text_content)

    # Fall back to text extraction if no items from images
    if not items_data and text_content:
        logger.info("[Extract] No items from images, falling back to text extraction")
        items_data = extract_from_text(client, text_content)

    # Convert to MenuItem objects
    items = []
    seen_names = set()
    for item in items_data:
        if isinstance(item, dict) and "name" in item:
            name = item.get("name", "").strip()
            if name and name.lower() not in seen_names:
                seen_names.add(name.lower())
                items.append(
                    MenuItem(
                        name=name,
                        price=parse_price(item.get("price")),
                        description=item.get("description"),
                    )
                )

    logger.info(f"[Extract] Extraction complete. Found {len(items)} unique items")
    return items


def extract_menu_from_images(image_urls: list[str]) -> list[MenuItem]:
    """
    Extract menu items directly from a list of image URLs.

    Useful when the user provides direct links to menu images.
    """
    logger.info(
        f"[ExtractImages] Starting extraction from {len(image_urls)} image URLs"
    )

    if not settings.openai_api_key:
        raise ValueError("OpenAI API key not configured")

    if not image_urls:
        logger.info("[ExtractImages] No image URLs provided")
        return []

    client = OpenAI(api_key=settings.openai_api_key)

    # Use the image URLs directly
    items_data = extract_with_vision(client, image_urls[:5], "")

    # Convert to MenuItem objects
    items = []
    seen_names = set()
    for item in items_data:
        if isinstance(item, dict) and "name" in item:
            name = item.get("name", "").strip()
            if name and name.lower() not in seen_names:
                seen_names.add(name.lower())
                items.append(
                    MenuItem(
                        name=name,
                        price=parse_price(item.get("price")),
                        description=item.get("description"),
                    )
                )

    logger.info(f"[ExtractImages] Extraction complete. Found {len(items)} unique items")
    return items
