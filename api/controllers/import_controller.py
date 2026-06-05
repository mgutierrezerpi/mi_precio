from fastapi import APIRouter, HTTPException, Depends
from controllers.deps import require_editor
from controllers.input_types.import_from_url import ImportFromUrl
from controllers.input_types.import_from_images import ImportFromImages
from views.extracted_items_view import ExtractedItemsView
from lib.services import extract_menu_items, extract_menu_from_images

router = APIRouter(prefix="/import", tags=["import"])


@router.post("/from-url")
def import_from_url_endpoint(
    data: ImportFromUrl,
    current_user: dict = Depends(require_editor),
) -> ExtractedItemsView:
    """
    Extract menu items from a business URL (Google Maps, website, etc).

    Uses GPT-4o vision to analyze menu images and extract product names,
    prices, and descriptions.
    """
    try:
        items = extract_menu_items(str(data.url))
        return ExtractedItemsView.render(items)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract items: {str(e)}")


@router.post("/from-images")
def import_from_images_endpoint(
    data: ImportFromImages,
    current_user: dict = Depends(require_editor),
) -> ExtractedItemsView:
    """
    Extract menu items directly from image URLs.

    Uses GPT-4o vision to analyze menu photos and extract product names,
    prices, and descriptions. Useful for menu boards, price lists, etc.
    """
    try:
        image_urls = [str(url) for url in data.image_urls]
        items = extract_menu_from_images(image_urls)
        return ExtractedItemsView.render(items)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract items: {str(e)}")
