"""HTTP page and image discovery for menu extraction."""

import base64
import logging
import re
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

def fetch_page(url: str) -> tuple[str, str]:
    """Fetch page and return (html, text_content)."""
    logger.info(f"[Fetch] Fetching page: {url}")
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    response = httpx.get(url, headers=headers, follow_redirects=True, timeout=30.0)
    response.raise_for_status()
    logger.info(
        f"[Fetch] Response status: {response.status_code}, size: {len(response.text)} chars"
    )

    html = response.text
    soup = BeautifulSoup(html, "html.parser")

    # Remove script and style elements for text extraction
    for element in soup(["script", "style", "nav", "footer"]):
        element.decompose()

    text = soup.get_text(separator="\n", strip=True)
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    logger.info(f"[Fetch] Extracted {len(lines)} lines of text")
    return html, "\n".join(lines)


def extract_image_urls(html: str, base_url: str) -> list[str]:
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
            src = urljoin(base_url, src)
        elif not src.startswith("http"):
            continue

        # Skip data URIs that are too small
        if src.startswith("data:") and len(src) < 1000:
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


def download_image_as_base64(url: str) -> str | None:
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
    except httpx.HTTPError:
        return None
