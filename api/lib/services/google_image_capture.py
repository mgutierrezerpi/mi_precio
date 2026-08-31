"""DuckDuckGo image-search capture phase for Google listing discovery."""

import logging
from collections.abc import Callable
from time import sleep

logger = logging.getLogger(__name__)


def capture_image_search(driver: object, query: str, capture: Callable[[str], str]) -> None:
    """Capture image-search results and a small set of enlarged menu images."""
    from selenium.common.exceptions import WebDriverException
    from selenium.webdriver.common.by import By

    url = f"https://duckduckgo.com/?q={query.replace(' ', '+')}&iax=images&ia=images"
    logger.info("[Browser] Searching DuckDuckGo images: %s", query)
    driver.get(url)
    sleep(3)
    capture("01_ddg_images")
    image_tiles = driver.find_elements(By.CSS_SELECTOR, "img.tile--img__img")
    logger.info("[Browser] Found %s image tiles", len(image_tiles))
    for index, tile in enumerate(image_tiles[:5]):
        try:
            driver.execute_script("arguments[0].scrollIntoView(true);", tile)
            sleep(0.3)
            tile.click()
            sleep(1)
            capture(f"02_image_{index}")
            _close_image_preview(driver, By)
        except WebDriverException as error:
            logger.debug("[Browser] Error with image %s: %s", index, error)


def _close_image_preview(driver: object, by: object) -> None:
    from selenium.common.exceptions import WebDriverException

    try:
        driver.find_element(by.CSS_SELECTOR, "a.detail__close").click()
    except WebDriverException:
        driver.find_element(by.TAG_NAME, "body").send_keys("\ue00c")
    sleep(0.3)
