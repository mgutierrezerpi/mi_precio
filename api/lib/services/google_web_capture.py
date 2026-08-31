"""DuckDuckGo web-search capture phase for Google listing discovery."""

import logging
from collections.abc import Callable
from time import sleep

from lib.services.google_result_scoring import score_result

logger = logging.getLogger(__name__)


def capture_web_results(
    driver: object,
    query: str,
    business_name: str,
    location: str,
    capture: Callable[[str], str],
) -> None:
    """Visit a few ranked web results and collect page screenshots."""
    from selenium.common.exceptions import WebDriverException
    from selenium.webdriver.common.by import By

    driver.get(f"https://duckduckgo.com/?q={query.replace(' ', '+')}")
    sleep(2)
    capture("03_ddg_web")
    scored = _rank_results(driver.find_elements(By.CSS_SELECTOR, "article[data-testid='result']"), By, business_name, location)
    for index, (score, link, href) in enumerate(scored[:3]):
        try:
            logger.info("[Browser] Visiting (score=%s): %s...", score, href[:60])
            link.click()
            sleep(3)
            capture(f"04_site_{index}_initial")
            driver.execute_script("window.scrollBy(0, 500)")
            sleep(0.5)
            capture(f"04_site_{index}_scroll")
            driver.back()
            sleep(1)
        except WebDriverException as error:
            logger.debug("[Browser] Error with result: %s", error)


def _rank_results(results: list[object], by: object, business_name: str, location: str) -> list[tuple[int, object, str]]:
    from selenium.common.exceptions import WebDriverException

    ranked = []
    for result in results:
        try:
            link = result.find_element(by.CSS_SELECTOR, "a[data-testid='result-title-a']")
            href = link.get_attribute("href").lower()
            score = score_result(href, result.text.lower(), business_name, location)
            if score is not None:
                ranked.append((score, link, href))
        except WebDriverException as error:
            logger.debug("[Browser] Could not rank result: %s", error)
    return sorted(ranked, key=lambda item: item[0], reverse=True)
