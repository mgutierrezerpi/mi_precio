"""OpenAI provider calls for extracting structured menu records."""

import json
import logging
import re

from openai import OpenAI

logger = logging.getLogger(__name__)

def extract_with_vision(
    client: OpenAI, image_data_list: list[str], text_content: str
) -> list[dict]:
    """Use GPT-4o vision to extract menu items from images."""
    logger.info(
        f"[Vision] Starting GPT-4o vision analysis with {len(image_data_list)} images"
    )

    # Build content array with images
    content = []

    # Add images first
    for img_data in image_data_list:
        if img_data.startswith("data:"):
            content.append(
                {"type": "image_url", "image_url": {"url": img_data, "detail": "high"}}
            )
        else:
            # Direct URL
            content.append(
                {"type": "image_url", "image_url": {"url": img_data, "detail": "high"}}
            )

    # Add text context
    text_excerpt = text_content[:5000] if text_content else ""
    content.append(
        {
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
- If no items found, return []""",
        }
    )

    logger.info("[Vision] Calling GPT-4o API...")
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": content}],
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


def extract_from_text(client: OpenAI, text_content: str) -> list[dict]:
    """Extract menu items from text content only."""
    logger.info(
        f"[Text] Starting text extraction, input length: {len(text_content)} chars"
    )

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
- If no items found, return []""",
            },
            {"role": "user", "content": f"Extract menu items:\n\n{text_content}"},
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
