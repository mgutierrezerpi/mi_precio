"""Selenium-based capture adapter for Google business listings."""

import logging
import os

from openai import OpenAI
from selenium.common.exceptions import WebDriverException

from lib.services.google_image_capture import capture_image_search
from lib.services.google_listing import parse_google_listing
from lib.services.google_web_capture import capture_web_results
from lib.services.menu_ai_provider import extract_with_vision

logger = logging.getLogger(__name__)

try:
    import undetected_chromedriver as uc

    CHROME_AVAILABLE = True
except ImportError:
    CHROME_AVAILABLE = False


def capture_google_listing(url: str, openai_client: OpenAI) -> list[dict]:
    """Extract menu items from Google Maps URL by searching on DuckDuckGo."""

    logger.info(f"[GoogleMaps] Starting extraction for: {url}")

    listing = parse_google_listing(url)
    business_name = listing.business_name
    location = listing.location
    place_id = listing.place_id

    logger.info(f"[GoogleMaps] Business: {business_name}")
    logger.info(f"[GoogleMaps] Location: {location}")
    logger.info(f"[GoogleMaps] Place ID: {place_id}")

    if not CHROME_AVAILABLE:
        raise ValueError(
            "Chrome driver no está instalado. Ejecuta: pipenv install undetected-chromedriver"
        )

    screenshots = []
    driver = None
    screenshots_dir = os.path.join(os.path.dirname(__file__), "screenshots")
    os.makedirs(screenshots_dir, exist_ok=True)

    try:
        # Set up Chrome options
        options = uc.ChromeOptions()
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--lang=es")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        logger.info("[Browser] Launching Chrome browser...")
        driver = uc.Chrome(options=options, headless=False, use_subprocess=True)
        driver.set_page_load_timeout(30)

        def save_screenshot(name: str) -> str:
            """Take screenshot, save to file, and return base64."""
            screenshot_b64 = driver.get_screenshot_as_base64()
            filepath = os.path.join(screenshots_dir, f"{name}.png")
            driver.save_screenshot(filepath)
            logger.info(f"[Browser] Screenshot saved: {filepath}")
            return screenshot_b64

        search_query = f"{business_name} {location} menú precios".strip()
        capture_image_search(driver, search_query, screenshots.append)

        capture_web_results(
            driver, search_query, business_name, location, screenshots.append
        )

    except WebDriverException as error:
        logger.error("[Browser] Browser error: %s", error)
        raise ValueError(f"Error al buscar el negocio: {error}") from error
    finally:
        if driver:
            driver.quit()
            logger.info("[Browser] Browser closed")

    if not screenshots:
        raise ValueError("No se pudieron capturar screenshots")

    # Convert screenshots to data URIs
    image_data_list = [f"data:image/png;base64,{s}" for s in screenshots]
    logger.info(
        f"[Browser] Captured {len(screenshots)} screenshots, analyzing with GPT-4o..."
    )

    # Use vision to extract menu items
    items_data = extract_with_vision(openai_client, image_data_list, "")
    logger.info(f"[Browser] Vision extraction found {len(items_data)} items")

    return items_data
