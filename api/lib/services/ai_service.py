"""AI service for extracting menu items from business URLs and images."""

import base64
import json
import logging
import re
from dataclasses import dataclass
from openai import OpenAI
import httpx
from bs4 import BeautifulSoup

from config import settings

logger = logging.getLogger(__name__)

# Undetected Chrome - for Google Maps scraping
try:
    import undetected_chromedriver as uc
    CHROME_AVAILABLE = True
except ImportError:
    CHROME_AVAILABLE = False


@dataclass
class MenuItem:
    """Represents a menu item extracted from a business page."""
    name: str
    price: float
    description: str | None = None


def _is_google_maps_url(url: str) -> bool:
    """Check if URL is a Google Maps URL or Google Search with business listing."""
    url_lower = url.lower()

    maps_patterns = [
        "google.com/maps",
        "google.com.ar/maps",
        "google.com.uy/maps",
        "maps.google.com",
        "maps.app.goo.gl",
        "goo.gl/maps",
        "share.google",
    ]

    # Check for Google Search with business listing indicators
    if "google.com" in url_lower and "/search" in url_lower:
        # ludocid = Local Unique Document ID (business listing)
        if "ludocid=" in url_lower:
            return True
        # Menu viewer
        if "menu-viewer" in url_lower:
            return True
        # Local photos
        if "localpoiphotos" in url_lower:
            return True

    return any(pattern in url_lower for pattern in maps_patterns)


def _extract_from_google_maps(url: str, openai_client: OpenAI) -> list[dict]:
    """Extract menu items from Google Maps URL by searching on DuckDuckGo."""
    import os
    import time
    from urllib.parse import urlparse, parse_qs, unquote

    logger.info(f"[GoogleMaps] Starting extraction for: {url}")

    # Extract business name, location, and place ID from URL
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    business_name = None
    place_id = None

    if "q" in params:
        business_name = unquote(params["q"][0])
    if "ludocid" in params:
        place_id = params["ludocid"][0]

    if not business_name:
        raise ValueError("No se pudo extraer el nombre del negocio de la URL")

    # Get location from Google domain
    domain = parsed.netloc.lower()
    location_map = {
        "google.com.uy": "Montevideo Uruguay",
        "google.com.ar": "Buenos Aires Argentina",
        "google.com.mx": "Ciudad de Mexico",
        "google.com.co": "Bogota Colombia",
        "google.com.pe": "Lima Peru",
        "google.com.cl": "Santiago Chile",
        "google.es": "España",
        "google.com": "",
    }
    location = ""
    for domain_suffix, loc in location_map.items():
        if domain_suffix in domain:
            location = loc
            break

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

        # Search on DuckDuckGo for the business menu (include location)
        search_query = f"{business_name} {location} menú precios".strip()
        ddg_url = f"https://duckduckgo.com/?q={search_query.replace(' ', '+')}&iax=images&ia=images"

        logger.info(f"[Browser] Searching DuckDuckGo images: {search_query}")
        driver.get(ddg_url)
        time.sleep(3)

        # Take screenshot of image search results
        screenshots.append(save_screenshot("01_ddg_images"))

        # Click on images to get larger versions
        from selenium.webdriver.common.by import By

        # Find image tiles
        image_tiles = driver.find_elements(By.CSS_SELECTOR, "img.tile--img__img")
        logger.info(f"[Browser] Found {len(image_tiles)} image tiles")

        for i, tile in enumerate(image_tiles[:5]):
            try:
                driver.execute_script("arguments[0].scrollIntoView(true);", tile)
                time.sleep(0.3)
                tile.click()
                time.sleep(1)
                screenshots.append(save_screenshot(f"02_image_{i}"))
                logger.info(f"[Browser] Captured image {i}")

                # Close the image preview
                try:
                    close_btn = driver.find_element(By.CSS_SELECTOR, "a.detail__close")
                    close_btn.click()
                    time.sleep(0.3)
                except Exception:
                    driver.find_element(By.TAG_NAME, "body").send_keys("\ue00c")  # Escape
                    time.sleep(0.3)
            except Exception as e:
                logger.debug(f"[Browser] Error with image {i}: {e}")
                continue

        # Also try regular web search for the business
        web_url = f"https://duckduckgo.com/?q={search_query.replace(' ', '+')}"
        logger.info(f"[Browser] Searching DuckDuckGo web: {search_query}")
        driver.get(web_url)
        time.sleep(2)

        screenshots.append(save_screenshot("03_ddg_web"))

        # Try to find and click on relevant results (menu pages, restaurant sites)
        # Prioritize results that match the location
        try:
            results = driver.find_elements(By.CSS_SELECTOR, "article[data-testid='result']")
            logger.info(f"[Browser] Found {len(results)} search results")

            # Keywords to identify location matches
            location_keywords = location.lower().split() if location else []
            skip_domains = ["facebook.com", "tripadvisor", "yelp.com", "foursquare.com"]

            # Score and sort results by location relevance
            scored_results = []
            for result in results:
                try:
                    link = result.find_element(By.CSS_SELECTOR, "a[data-testid='result-title-a']")
                    href = link.get_attribute("href").lower()
                    text = result.text.lower()

                    # Skip unwanted domains
                    if any(d in href for d in skip_domains):
                        continue

                    # Score based on location match
                    score = 0
                    for kw in location_keywords:
                        if kw in text or kw in href:
                            score += 10

                    # Prefer Instagram (usually has menu photos)
                    if "instagram.com" in href:
                        score += 5

                    # Prefer direct business sites
                    if business_name.lower().split()[0] in href:
                        score += 5

                    scored_results.append((score, result, link, href))
                except Exception:
                    continue

            # Sort by score descending
            scored_results.sort(key=lambda x: x[0], reverse=True)
            logger.info(f"[Browser] Scored results: {[(s[0], s[3][:50]) for s in scored_results[:5]]}")

            visited = 0
            for score, result, link, href in scored_results:
                if visited >= 3:
                    break
                try:
                    logger.info(f"[Browser] Visiting (score={score}): {href[:60]}...")
                    link.click()
                    time.sleep(3)

                    screenshots.append(save_screenshot(f"04_site_{visited}_initial"))

                    # Scroll down
                    driver.execute_script("window.scrollBy(0, 500)")
                    time.sleep(0.5)
                    screenshots.append(save_screenshot(f"04_site_{visited}_scroll"))

                    # Go back
                    driver.back()
                    time.sleep(1)
                    visited += 1
                except Exception as e:
                    logger.debug(f"[Browser] Error with result: {e}")
                    continue
        except Exception as e:
            logger.debug(f"[Browser] Error processing results: {e}")

    except Exception as e:
        logger.error(f"[Browser] Browser error: {e}")
        raise ValueError(f"Error al buscar el negocio: {e}")
    finally:
        if driver:
            driver.quit()
            logger.info("[Browser] Browser closed")

    if not screenshots:
        raise ValueError("No se pudieron capturar screenshots")

    # Convert screenshots to data URIs
    image_data_list = [f"data:image/png;base64,{s}" for s in screenshots]
    logger.info(f"[Browser] Captured {len(screenshots)} screenshots, analyzing with GPT-4o...")

    # Use vision to extract menu items
    items_data = _extract_with_vision(openai_client, image_data_list, "")
    logger.info(f"[Browser] Vision extraction found {len(items_data)} items")

    return items_data


def _fetch_page(url: str) -> tuple[str, str]:
    """Fetch page and return (html, text_content)."""
    logger.info(f"[Fetch] Fetching page: {url}")
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    response = httpx.get(url, headers=headers, follow_redirects=True, timeout=30.0)
    response.raise_for_status()
    logger.info(f"[Fetch] Response status: {response.status_code}, size: {len(response.text)} chars")

    html = response.text
    soup = BeautifulSoup(html, "html.parser")

    # Remove script and style elements for text extraction
    for element in soup(["script", "style", "nav", "footer"]):
        element.decompose()

    text = soup.get_text(separator="\n", strip=True)
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    logger.info(f"[Fetch] Extracted {len(lines)} lines of text")
    return html, "\n".join(lines)


def _extract_image_urls(html: str, base_url: str) -> list[str]:
    """Extract image URLs from HTML, prioritizing menu-related images."""
    soup = BeautifulSoup(html, "html.parser")
    image_urls = []

    # Find all images
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if not src:
            continue

        # Skip tiny images, icons, logos
        width = img.get("width", "")
        height = img.get("height", "")
        if width and height:
            try:
                if int(width) < 100 or int(height) < 100:
                    continue
            except ValueError:
                pass

        # Make absolute URL
        if src.startswith("//"):
            src = "https:" + src
        elif src.startswith("/"):
            from urllib.parse import urljoin
            src = urljoin(base_url, src)
        elif not src.startswith("http"):
            continue

        # Skip data URIs that are too small
        if src.startswith("data:"):
            if len(src) < 1000:
                continue

        image_urls.append(src)

    # Also look for background images in style attributes
    for element in soup.find_all(style=True):
        style = element.get("style", "")
        urls = re.findall(r'url\(["\']?(https?://[^"\')\s]+)["\']?\)', style)
        image_urls.extend(urls)

    # Deduplicate while preserving order
    seen = set()
    unique_urls = []
    for url in image_urls:
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)

    return unique_urls[:10]  # Limit to 10 images


def _download_image_as_base64(url: str) -> str | None:
    """Download an image and return as base64 data URI."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }
        response = httpx.get(url, headers=headers, follow_redirects=True, timeout=15.0)
        response.raise_for_status()

        content_type = response.headers.get("content-type", "image/jpeg")
        if ";" in content_type:
            content_type = content_type.split(";")[0]

        # Only process images
        if not content_type.startswith("image/"):
            return None

        base64_data = base64.b64encode(response.content).decode("utf-8")
        return f"data:{content_type};base64,{base64_data}"
    except Exception:
        return None


def _parse_price(price_str: str | None) -> float:
    """Parse a price string to float."""
    if not price_str:
        return 0.0
    if isinstance(price_str, (int, float)):
        return float(price_str)
    # Remove currency symbols and spaces, handle commas
    cleaned = re.sub(r"[^\d.,]", "", str(price_str))
    # Handle different decimal separators
    if "," in cleaned and "." in cleaned:
        cleaned = cleaned.replace(",", "")
    elif "," in cleaned:
        cleaned = cleaned.replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def _extract_with_vision(client: OpenAI, image_data_list: list[str], text_content: str) -> list[dict]:
    """Use GPT-4o vision to extract menu items from images."""
    logger.info(f"[Vision] Starting GPT-4o vision analysis with {len(image_data_list)} images")

    # Build content array with images
    content = []

    # Add images first
    for img_data in image_data_list:
        if img_data.startswith("data:"):
            content.append({
                "type": "image_url",
                "image_url": {"url": img_data, "detail": "high"}
            })
        else:
            # Direct URL
            content.append({
                "type": "image_url",
                "image_url": {"url": img_data, "detail": "high"}
            })

    # Add text context
    text_excerpt = text_content[:5000] if text_content else ""
    content.append({
        "type": "text",
        "text": f"""Analyze these images from a business page. Extract ALL menu items, products, or services with their prices.

Additional page text for context:
{text_excerpt}

Return a JSON array of objects with these fields:
- name: string (product/item name, in the original language)
- price: number (price as decimal, e.g., 150.00 - just the number, no currency)
- description: string or null (brief description if visible)

Rules:
- Extract EVERY item with a visible price
- If price shows "150" or "$150" or "150,00", return 150.00
- If you see a menu board, menu card, or price list in the image, extract ALL items from it
- Include items even if description is not available (set to null)
- Return ONLY valid JSON array, no markdown or explanation
- If no items found, return []"""
    })

    logger.info("[Vision] Calling GPT-4o API...")
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": content
            }
        ],
        temperature=0.1,
        max_tokens=4000,
    )

    result = response.choices[0].message.content or "[]"
    logger.info(f"[Vision] GPT-4o response received, length: {len(result)} chars")

    # Clean up markdown formatting
    result = result.strip()
    if result.startswith("```"):
        result = re.sub(r"^```(?:json)?\n?", "", result)
        result = re.sub(r"\n?```$", "", result)

    try:
        return json.loads(result)
    except json.JSONDecodeError:
        return []


def _extract_from_text(client: OpenAI, text_content: str) -> list[dict]:
    """Extract menu items from text content only."""
    logger.info(f"[Text] Starting text extraction, input length: {len(text_content)} chars")

    max_chars = 15000
    if len(text_content) > max_chars:
        text_content = text_content[:max_chars]
        logger.info(f"[Text] Truncated to {max_chars} chars")

    logger.info("[Text] Calling GPT-4o-mini API...")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """You extract menu items from business page text.

Return a JSON array of objects:
- name: string (product name)
- price: number (price as decimal)
- description: string or null

Rules:
- Only include items with both name AND price
- Return ONLY valid JSON, no markdown
- If no items found, return []"""
            },
            {
                "role": "user",
                "content": f"Extract menu items:\n\n{text_content}"
            }
        ],
        temperature=0.1,
        max_tokens=4000,
    )

    result = response.choices[0].message.content or "[]"
    logger.info(f"[Text] GPT-4o-mini response received, length: {len(result)} chars")
    result = result.strip()
    if result.startswith("```"):
        result = re.sub(r"^```(?:json)?\n?", "", result)
        result = re.sub(r"\n?```$", "", result)

    try:
        items = json.loads(result)
        logger.info(f"[Text] Parsed {len(items)} items from text")
        return items
    except json.JSONDecodeError as e:
        logger.error(f"[Text] Failed to parse JSON response: {e}")
        return []


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
    if _is_google_maps_url(url):
        logger.info("[Extract] Detected Google Maps URL, using Outscraper")
        items_data = _extract_from_google_maps(url, client)
    else:
        # Regular website - use simple HTTP fetch
        logger.info("[Extract] Regular URL, using HTTP fetch")
        html, text_content = _fetch_page(url)
        image_urls = _extract_image_urls(html, url)
        logger.info(f"[Extract] Found {len(image_urls)} images in page")

        for img_url in image_urls[:5]:
            if img_url.startswith("data:"):
                image_data_list.append(img_url)
            else:
                image_data_list.append(img_url)

    # Use vision to extract menu items from images/screenshots
    if image_data_list:
        logger.info(f"[Extract] Processing {len(image_data_list)} images with vision")
        items_data = _extract_with_vision(client, image_data_list[:5], text_content)

    # Fall back to text extraction if no items from images
    if not items_data and text_content:
        logger.info("[Extract] No items from images, falling back to text extraction")
        items_data = _extract_from_text(client, text_content)

    # Convert to MenuItem objects
    items = []
    seen_names = set()
    for item in items_data:
        if isinstance(item, dict) and "name" in item:
            name = item.get("name", "").strip()
            if name and name.lower() not in seen_names:
                seen_names.add(name.lower())
                items.append(MenuItem(
                    name=name,
                    price=_parse_price(item.get("price")),
                    description=item.get("description"),
                ))

    logger.info(f"[Extract] Extraction complete. Found {len(items)} unique items")
    return items


def extract_menu_from_images(image_urls: list[str]) -> list[MenuItem]:
    """
    Extract menu items directly from a list of image URLs.

    Useful when the user provides direct links to menu images.
    """
    logger.info(f"[ExtractImages] Starting extraction from {len(image_urls)} image URLs")

    if not settings.openai_api_key:
        raise ValueError("OpenAI API key not configured")

    if not image_urls:
        logger.info("[ExtractImages] No image URLs provided")
        return []

    client = OpenAI(api_key=settings.openai_api_key)

    # Use the image URLs directly
    items_data = _extract_with_vision(client, image_urls[:5], "")

    # Convert to MenuItem objects
    items = []
    seen_names = set()
    for item in items_data:
        if isinstance(item, dict) and "name" in item:
            name = item.get("name", "").strip()
            if name and name.lower() not in seen_names:
                seen_names.add(name.lower())
                items.append(MenuItem(
                    name=name,
                    price=_parse_price(item.get("price")),
                    description=item.get("description"),
                ))

    logger.info(f"[ExtractImages] Extraction complete. Found {len(items)} unique items")
    return items
