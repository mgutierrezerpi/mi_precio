# UX Improvements Plan

## Phase 1: Quick Wins (Implementing Now)

### 1. Full-Screen Mode for Public Menu
- **Effort**: Very Low
- **Impact**: High (essential for TV/kiosk displays)
- **Implementation**: Add fullscreen toggle button, hide on fullscreen

### 2. Ornamental Dividers
- **Effort**: Low
- **Impact**: Medium (adds visual elegance)
- **Implementation**: SVG decorative elements between sections

### 3. Item Categories/Groups
- **Effort**: Medium
- **Impact**: Very High (organization is crucial)
- **Implementation**:
  - Add `category` field to Item model
  - Group items by category in public menu
  - Allow category management in admin

### 4. Menu Theme Presets (2-3 themes)
- **Effort**: Medium
- **Impact**: High (visual variety, brand customization)
- **Themes**:
  - Classic (current gold/cream on dark)
  - Bistro (warm cream paper, brown tones)
  - Modern (clean whites, minimal)

---

## Phase 2: Future Enhancements

### Product Information & Transparency ⭐ HIGH PRIORITY

#### Allergen Icons
Display icons for common allergens to help customers make informed choices:
- 🌾 **Gluten** - Contains wheat, barley, rye
- 🥜 **Nuts** - Tree nuts, peanuts
- 🥛 **Dairy** - Milk, cheese, butter
- 🥚 **Eggs** - Contains eggs
- 🦐 **Shellfish** - Shrimp, crab, lobster
- 🐟 **Fish** - Contains fish
- 🫘 **Soy** - Soybeans, soy products
- 🌱 **Celery** - Celery and celeriac

**Implementation**: Add `allergens` field (JSON array) to Item model

#### Dietary Tags
Quick visual indicators for dietary preferences:
- 🌿 **Vegetarian** - No meat
- 🌱 **Vegan** - No animal products
- 🥩 **Keto** - Low carb, high fat
- ☪️ **Halal** - Islamic dietary compliant
- ✡️ **Kosher** - Jewish dietary compliant
- 🚫🌾 **Gluten-Free** - No gluten ingredients
- 🔥 **Spicy** - With spiciness level (1-3 🌶️)

**Implementation**: Add `dietary_tags` field (JSON array) to Item model

#### Sourcing & Origin Information
Build trust with transparency about where ingredients come from:
- 📍 **Local** - Sourced within 100km
- 🌿 **Organic** - Certified organic ingredients
- ☕ **Fair Trade** - Ethically sourced
- 🏔️ **Origin** - "Coffee from Colombia", "Wine from Mendoza"
- 🧑‍🌾 **Farm/Supplier** - "From Granja Don Pedro"
- 🌊 **Sustainable** - Sustainably sourced seafood

**Implementation**: Add `sourcing_info` text field to Item model

#### Nutritional Information (Optional Display)
For health-conscious customers:
- Calories per serving
- Macros: Protein, Carbs, Fat
- Serving size

**Implementation**: Add `nutrition` JSON field to Item model

### Display & Presentation

#### Kiosk/TV Mode
For restaurant displays:
- Auto-scrolling content
- Timed rotation between lists/categories
- No UI controls visible
- Optional background music sync

#### Slideshow Mode
- Fade between category sections
- Configurable timing
- Pause on hover (desktop)

#### Layout Options
- **Two-Column Layout**: For wider displays
- **Grid with Photos**: Visual menu style
- **Compact List**: Maximum density for many items

#### Daily Specials Section
- Highlighted prominently
- Time-based visibility
- Special styling/badge

### Sharing & Export

- **QR Code Generator**: Auto-generated per menu, printable
- **Print/PDF Export**: Clean, professional format
- **Social Preview Cards**: OG images for sharing links
- **Embeddable Widget**: iframe code for websites

### Smart Features

- **Time-Based Menus**: Breakfast (6-11), Lunch (11-4), Dinner (4-close)
- **Seasonal Items**: Tag items, auto-hide out of season
- **Price History**: Track changes over time
- **Analytics**: Most viewed items, popular times

### Accessibility

- **High Contrast Mode**: Enhanced visibility
- **Large Text Mode**: Adjustable font sizes
- **Screen Reader**: Full ARIA label support
- **Keyboard Navigation**: Full keyboard support

---

## Implementation Order (Today)

1. Full-screen toggle (5 min)
2. Ornamental dividers (15 min)
3. Item categories - backend (20 min)
4. Item categories - frontend (30 min)
5. Menu themes (30 min)
6. Document future ideas in code comments
