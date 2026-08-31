"""Ranking policy for pages discovered while capturing a Google listing."""


_SKIPPED_DOMAINS = ("facebook.com", "tripadvisor", "yelp.com", "foursquare.com")


def score_result(
    href: str,
    text: str,
    business_name: str,
    location: str,
) -> int | None:
    """Return relevance score, or None when the result is intentionally skipped."""
    if any(domain in href for domain in _SKIPPED_DOMAINS):
        return None
    score = sum(10 for word in location.lower().split() if word in text or word in href)
    if "instagram.com" in href:
        score += 5
    first_word = business_name.lower().split()[0]
    if first_word in href:
        score += 5
    return score
