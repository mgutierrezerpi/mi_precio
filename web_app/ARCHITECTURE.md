# Mi Precio Web App - Architecture

## Overview

React + TypeScript SPA for managing digital menus and price lists. Built with Vite, Redux Toolkit, React Router, and Tailwind CSS v4.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| State Management | Redux Toolkit |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| Testing | Vitest + Testing Library |

## Folder Structure

```
web_app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main app layout with sidebar/nav
│   │   ├── Card.tsx         # Card container
│   │   ├── Button.tsx       # Button variants
│   │   ├── Input.tsx        # Form input
│   │   ├── Badge.tsx        # Status badges
│   │   ├── MenuItem.tsx     # Menu item card (grid/list)
│   │   ├── PageHeader.tsx   # Page title + actions
│   │   ├── LoadingSpinner.tsx
│   │   └── index.ts         # Barrel exports
│   │
│   ├── screens/             # Page components (feature-based)
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── menu/
│   │   │   └── MenuScreen.tsx
│   │   └── admin/
│   │       ├── LoginScreen.tsx
│   │       ├── DashboardScreen.tsx
│   │       ├── ListsScreen.tsx
│   │       └── ItemsScreen.tsx
│   │
│   ├── store/               # Redux state management
│   │   ├── index.ts         # Store configuration
│   │   ├── hooks.ts         # Typed useDispatch/useSelector
│   │   └── slices/
│   │       ├── menuSlice.ts      # Menu/items state + async thunks
│   │       ├── uiSlice.ts        # UI state (sidebar, theme, viewMode)
│   │       ├── authSlice.ts      # Auth state + login/logout
│   │       └── *.test.ts         # Slice tests
│   │
│   ├── hooks/               # Custom React hooks (empty, for future)
│   ├── services/            # API services (empty, for future)
│   ├── constants/           # App constants (empty, for future)
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   │
│   ├── routes.tsx           # Router configuration
│   ├── App.tsx              # Root component (Provider + Router)
│   ├── main.tsx             # Entry point
│   └── index.css            # Tailwind imports + custom styles
│
├── vite.config.ts           # Vite + Tailwind + Vitest config
├── vitest.setup.ts          # Test setup (localStorage mock)
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies + scripts
```

## Data Model

Based on the legacy Ruby app, adapted for the future Python API:

```typescript
// Multi-tenant support
interface Tenant {
  id: string
  name: string
  subdomain: string
  logo?: string
  primaryColor?: string
}

// Price list / Menu
interface List {
  id: string
  tenantId: string
  name: string
  published: boolean
  showOnIndex: boolean
}

// Version control for lists
interface ListVersion {
  id: string
  listId: string
  versionNumber: number
  name: string
  published: boolean
}

// Menu item
interface Item {
  id: string
  listVersionId: string
  name: string
  price: number
  description?: string
  position: number
  pictureUrl?: string
}
```

## Redux Store

### Slices

| Slice | Purpose | Key State |
|-------|---------|-----------|
| `menu` | Menu data and items | lists, items, currentList, isLoading, error |
| `ui` | UI preferences | sidebarOpen, mobileMenuOpen, theme, viewMode |
| `auth` | Authentication | user, tenant, isAuthenticated |

### Async Thunks

- `fetchLists(tenantId)` - Fetch lists for tenant
- `fetchItems(listVersionId)` - Fetch items for list version
- `login({ email, password })` - User authentication
- `logout()` - Clear auth state

## Routes

| Path | Screen | Description |
|------|--------|-------------|
| `/` | HomeScreen | Landing page |
| `/menu` | MenuScreen | Public menu view |
| `/login` | LoginScreen | Admin login |
| `/planes` | ChoosePlanScreen | Blocking plan selection for new signups (see below) |
| `/admin` | DashboardScreen | Admin dashboard |
| `/admin/lists` | ListsScreen | Manage price lists |
| `/admin/items` | ItemsScreen | Manage menu items |

### Plan gate

Accounts created after paid onboarding shipped carry `tenant.planGate`. While they
have no paid plan, `selectNeedsPlan` is true and:

- `AdminExperienceLayout` redirects `/admin/*` to `/planes`
- `AuthCard` / `HomeScreen` send a fresh login to `/planes` instead of the panel
- any API call answered with `402 { code: "plan_required" }` re-reads the tenant
  and bounces to `/planes` (`setPlanRequiredHandler` in `App.tsx`)

The gate lifts as soon as the plan is not `free` — via the Lemon Squeezy checkout,
or immediately when `billingEnabled` is false (local dev, no gateway). Tenants
created before the gate have `planGate` false and are never blocked.

### First-login onboarding

Two pieces, both **CRM-only** — `/p/*` belongs to the shop and never shows a
MiPrecio tour (see the dead-ends rule below).

`OnboardingTour` (`screens/admin/crm/`) is a guided spotlight mounted by
`AdminExperienceLayout`, i.e. **past the plan gate** — an account still on
`/planes` has no CRM to be taught. It opens once per user on first login
(`isTourSeen`, localStorage keyed by user id, so a second team member gets its
own run) and again from "Volver a ver el recorrido" in Soporte and on the
checklist, via `uiSlice.tourOpen`.

Every step points at the **sidebar**, which is on screen on every admin route,
so the tour never navigates the user mid-run. Steps are declared in
`lib/onboardingTour.ts` and anchored by `data-tour` attributes on `CrmSidebar`
items. Two mechanics are easy to break:

- The overlay renders **outside** the `CrmLayout` tree, so it must carry `dash`
  (the class that scopes `--dash-*`) and `font-sans` itself — without them the
  card is transparent and set in the body serif.
- The spotlight's dimming is an inline `boxShadow` spread past the viewport.
  An inline `boxShadow` **replaces** Tailwind's `ring-*`, so the ring and the
  dimming have to live in that one declaration.

An anchor that is missing or off-screen (the sidebar below `lg` is a drawer
parked outside the viewport) measures to `null`, and the step degrades to a
centered card with the whole page dimmed. Highlighting something the user
cannot see is worse than not highlighting at all.

`FirstSteps` is the checklist the tour leaves behind on the dashboard. Its five
rows are **derived from real data on every render**, never stored:

| Step | Done when |
|---|---|
| Agregá tus productos | the catalog has any product |
| Configurá cómo se ve tu lista | any of `logoUrl` / `brandColor` / `listDesign` / `listHeroColor` / `listBgUrl` is set |
| Configurá tu lista | any list exists |
| Publicá tu lista | some list is `published && live` |
| Compartí tu QR o tu link | `markQrShared` fired |

There is deliberately **no "pick a plan" step**: the plan gate means an account
without one never reaches this screen. "Products" counts the catalog rather
than list items because it now precedes list creation — which is why
`DashboardScreen` dispatches `fetchProducts`. "Design" reads the appearance
fields because all of them are `null` on a fresh tenant, so a value there is
always a deliberate choice and never a default we handed out. "Publish"
insists on `live`: a list the plan no longer serves is not published to anyone.

Sharing is the one step with no server-side trace, so `markQrShared` records it
(copy link in the sidebar or dashboard, any QR download) and fires
`FIRST_STEPS_EVENT` so the row ticks without waiting for a remount.

The card retires itself. Completion is persisted the moment it happens, so it
never returns — a finished checklist is clutter on a dashboard opened daily.
Two cases are deliberately different: already complete when the screen opened
means nothing was achieved here and it does not render at all; completed while
the shop watched holds the "¡Listo!" state for `CELEBRATION_MS` and then fades,
rather than vanishing from under the cursor that just completed it.

### List appearance

Each list may override the business defaults for `design`, `heroColor`, `bgUrl`
and `bgOverlay`; `null` on a list means "inherit". `ListAppearanceFields`
(`components/appearance/`) renders those controls and is shared by both editors:

- **Configuración → Marca y apariencia** — a "Personalizar" select switches
  between the tenant defaults and one list; edits autosave to whichever is
  selected.
- **Listas de precios → editar lista** — a collapsed "Apariencia de esta lista"
  block, saved with the rest of the list.

`MenuScreen` resolves the cascade per field, and only when the URL targets a
single list — the index route merges all published lists and keeps the business
default.

### Social links in the public footer

`lib/socials.ts` is the single definition of the shop's networks — used by the
Settings → Marca fields that capture them and the footer that renders them.
`activeSocials(tenant)` returns only the ones filled in, so a shop with none
gets no icon row at all rather than a line of placeholders advertising that it
has no presence anywhere.

`hrefOf` builds `wa.me/<digits>` for WhatsApp and passes the rest through. It
also re-adds a missing scheme defensively: a scheme-less href resolves as a
*relative path*, which would trap the customer inside `/p/shop/...` instead of
sending them off-site.

`socialError` mirrors only the **rejection** rules of the API's normaliser,
never its rewriting — there is one canonical form and it is server-side. It
exists because a rejected PATCH surfaces as a bare `Error 422`: FastAPI sends
validation detail as a list, which `api.request` cannot turn into a sentence a
shop can act on. A field with an error is held back rather than sent.

The footer is **not one component**: besides Storefront and CartView in
`MenuScreen`, each of the eight templates in `designs.tsx` has its own footer
with its own palette. All nine render the shared `components/SocialLinks`.
That component draws bare glyphs with no chip behind them on purpose — the
designs run from near-black to off-white footers, and any fixed overlay colour
is invisible on half of them.

Layout follows each design's character: the left-aligned footers put the shop's
details on the left and the icons on the right, while the three editorial
templates (`classic`, `nordic`, `fine`) and the cart keep everything centred,
because centring is what those designs are.

### The printable QR poster

Códigos QR downloads an **A4 poster**, never a bare code: a shop tapes a sheet
to its counter, not a PNG of a square. Both buttons produce the same poster —
SVG for a print shop, PNG (300dpi) for a WhatsApp.

The sheet is **MiPrecio's, not the shop's**: our violet gradient, our mark, and
"Hecho con MiPrecio · miprecio.app" at the foot. It hangs where strangers see
it every day, so it works as advertising for the product — the same reason a
Mercado Pago sticker is Mercado Pago yellow. Nothing of the shop appears on it;
which list a poster opens lives in the code and in the file name, since the
customer is already standing in the shop.

`lib/qrPosterSvg.ts` builds it as **one SVG**, and `lib/exportQrPoster.ts`
saves that string or rasterises it. Deliberately not a captured DOM node: an
SVG holding a screenshot is useless to a printer, while this one keeps the code
as vector paths and weighs ~8KB. It is also why the poster needs no React
component, no off-screen mount and no html2canvas.

Load-bearing details:

- **The code always sits on a white card.** Scanners need the contrast, and it
  keeps the violet branding instead of fighting the code.
- **Positions are computed, not written.** Each element stacks off the previous
  one and text baselines derive from their font size, so changing a size cannot
  silently misalign everything below it. A test pins that the air above the
  mark and below the footer stay within a quarter of each other.
- **The mark is sized by width** (it is a wordmark) and clamped, so a future
  logo file cannot run off the sheet.
- **The mark is re-encoded to PNG and inlined.** It ships as WebP, which print
  software may refuse inside an SVG, and neither export can fetch anything
  later: an SVG saved to disk shows a broken image, and an SVG rasterised
  through an `<img>` may not load external resources at all. The `<image>`
  carries both `href` and `xlink:href` because old renderers only know the
  latter.

There is no QR colour picker or centre-logo toggle any more. Both only changed
a preview the poster ignored, and a control that promises something it does not
deliver is worse than no control.

### Exporting a list to PDF

"Exportar a PDF" in a list's row menu opens its own public page with `?pdf=1`.
That page renders the list, captures itself and downloads the file
(`lib/exportListPdf` + `hooks/useExportPdfWhenReady`).

The sheet is a **picture of the real page**, not a redrawing of it. The nine
designs stay the single source of truth, so the export cannot drift from what a
customer sees and a template added later needs no work here. The trade, chosen
deliberately, is that the text lands as image: not selectable, not searchable.
Vector output would mean either rebuilding all nine designs or running headless
Chromium on a 1GB Fly VM — see [[pdf-export-decisions]] in memory.

Three properties are load-bearing:

- **One page, exactly as tall as the list.** No pagination means nothing can be
  cut across sheets — not a product row, not a framed card, not a section. An
  earlier `@page`/print-dialog version fought this and lost: paper size is
  chosen in the browser's dialog, so the content always had to break somewhere.
- **Width measured, not assumed.** `contentWidthOf` finds where the content
  column actually starts and ends and captures that plus a margin. The designs
  centre themselves in a `max-width`, so capturing at the browser's width
  buried the menu in background — on a 1905px window a 1235px column wasted
  363px a side. Elements spanning the full width are skipped: a full-bleed hero
  says nothing about where the content sits. Only the captured box is resized,
  never the window, so media queries still answer to the real viewport and the
  design keeps its desktop layout.
- **Height read after narrowing.** A narrower column rewraps text and grows;
  measuring first would cut the tail off.

The capture waits for `document.fonts.ready` and every image to decode, or
6 seconds — a shop with one broken photo still gets its PDF. The page wears
`.mp-exporting` (index.css) meanwhile, which hides what only makes sense on a
screen: search, category chips, add-to-cart and the cart button.

`html2canvas-pro` and `jspdf` are imported dynamically, so ~600KB of libraries
load only on the export route and stay out of the main bundle.

### Hero colour across the designs

`heroColor` resolves as list override → tenant default → brand colour, so it is
always a real colour.

**On the public list the accent IS the hero colour.** `MenuScreen` builds the
palette it hands the designs (`C`, `accent`, `brandGradient`) from `heroColor`
rather than from `brandColor`. That is a single point, and it exists because
without it a shop that set a hero colour got a page split between two: badges
and section rules on the brand colour, everything else on the hero. Shops that
never chose a hero colour see no change — it falls back to their brand.

Each design still decides *which surface* wears it, because painting the same
element everywhere would wreck templates built around a fixed palette:

| Design | What the hero colour paints |
|---|---|
| `modern`, `cards`, `catalog`, `tech` | the coloured header band |
| `fine` | the stage framing the menu card (cream paper and gold rules stay) |
| `classic` | top bar, masthead tint and accents |
| `nordic` | a light wash of it becomes the paper, plus the accents |
| `photo` | a dark shade of it becomes the page, plus prices and controls |

`nordic` and `photo` tint rather than replace on purpose: `nordic` is text on a
warm ground and a saturated ground costs the legibility that is its point,
while `photo` needs to stay dark so the photographs lead. Both use `lighten` /
`darken` from `designs.tsx`.

**`darken(hex, amt)` is not `lighten(hex, -amt)`.** `lighten` mixes toward
white, so a negative amount subtracts a share of the distance *to white*: a
bright channel barely moves and a dark one runs past zero, serialising as
`-d1` and making the whole colour unparseable — the browser then drops it and
the element loses its background. `#F59E0B` at `-0.9` came out `#ec47-d1`,
lighter and invalid. Both helpers clamp their channels now, and
`designColors.test.ts` pins the case.

### Dead ends on a public link

Whoever hits these is the **shop's** customer, standing somewhere with a phone
and a QR — not a MiPrecio prospect. `MenuScreen` splits them by how much we know:

| | What we know | What we show |
|---|---|---|
| Subdomain matches nothing | nothing | our logo, our purple, and a short pitch — the only dead end that may link to `/` |
| Slug matches no served list, shop has others | its skin + its live lists | `ListNotFound`: the shop's own storefront look, its other lists, "Ver todo el catálogo" |
| Slug matches nothing and neither does anything else | its skin only | same shell, "el catálogo no está disponible" — no links out |

The middle row is the common one: a renamed or unpublished list, and every list
the plan no longer serves. Linking to `/` there would answer "where is the menu?"
with a page selling them our product.

`ListNotFound` is not a generic white card: no single list is being shown, so it
resolves the appearance cascade from the shop's **main list** (`showOnIndex`,
exposed on `PublicListView` for this) and falls back field by field to the
business defaults — same rule as the storefront. `cartThemeFor(design)` supplies
the palette, so a shop on the dark `tech` or `fine` template gets a dark dead
end, and the background image and hero colour carry over too.

The API's `error` string is its raw `detail` — English, written for us. It goes
to `console.warn`, never on screen.

The no-such-shop page doubles as a landing: whoever reached it already scans QR
menus, which is the product. Its copy mirrors the real landing rather than
running a second, parallel message, and it is sized to one viewport
(`h-[100dvh]`, ~516px of content at 390px wide) — a dead end nobody meant to
open should never ask to be scrolled.

### Subscription panel

`SubscriptionPanel` (bottom of Settings → Plan y facturación) shows the state,
dates and card from `PlanInfo.billing`, plus the provider portal links and the
cancel / resume actions (`api.cancelSubscription` / `resumeSubscription`,
owner-only). It renders nothing when the account never subscribed.

Cancelling is at the end of the paid period: `status: "cancelled"` still means
"paid plan, access until `endsAt`", so the panel reads "access until X" and
offers Resume instead of treating the account as downgraded. The plan only
drops to `free` on `expired`, which is what the plan gate then blocks on.

`PlanInfo.billing` keys are **camelCase** — `api.request` camelizes every
response key. Declaring them snake_case is what silently broke the portal link
before, and the type made it invisible to TS.

### Lists the plan does not serve

`PriceList.published` is the owner's intent; `PriceList.live` is what the plan
actually serves. They diverge after a downgrade (more lists published than the
plan allows) or when a subscription expires (nothing is served at all). The
backend never unpublishes to reconcile them, so paying again brings everything
back on its own — which means the CRM is the only place that can admit the list
is unreachable.

`PriceListsScreen` does that three ways: a red **Fuera de línea** badge on the
row with its public URL hidden, a **Fuera de línea** tab that only appears when
some list is in that state, and a banner naming the count with a way out. The
**Activas** counter deliberately counts `published && live`, not `published` —
otherwise it contradicts the badges right below it.

## Components

### Layout Components

- **Layout** - Main app shell with responsive sidebar, mobile menu, header

### UI Components

- **Button** - Variants: primary, secondary, outline, ghost, danger
- **Card** - Container with optional padding sizes
- **Input** - Form input with label, error, helper text
- **Badge** - Status indicators: default, success, warning, danger, info
- **MenuItem** - Menu item display (grid or list view)
- **PageHeader** - Page title with optional subtitle and action
- **LoadingSpinner** - Animated loading indicator

## Styling

- **Tailwind CSS v4** with Vite plugin
- **Color scheme**: Emerald primary (`#059669`), Amber secondary
- **Dark mode**: System preference support (ready for toggle)
- **Forms**: `@tailwindcss/forms` plugin for form element styling

## Testing

- **Framework**: Vitest with happy-dom
- **Test files**: Co-located with source (`*.test.ts`)
- **Coverage**: Available via `npm run test:coverage`

### Current Tests

- `menuSlice.test.ts` - Menu state reducers
- `uiSlice.test.ts` - UI state reducers
- `authSlice.test.ts` - Auth state reducers

## Scripts

```bash
yarn dev          # Start dev server
yarn build        # Production build
yarn preview      # Preview production build
yarn test         # Run tests once
yarn test:watch   # Run tests in watch mode
yarn test:coverage # Run tests with coverage
yarn lint         # Run ESLint
```

## Future Enhancements

1. **API Integration** - Replace mock data with Python API calls
2. **Protected Routes** - Add auth guards for admin routes
3. **i18n** - Multi-language support (ES/EN)
4. **PWA** - Offline support for menu viewing
5. **QR Code Generation** - Generate QR codes for tables
6. **Image Upload** - Upload item pictures
7. **Drag & Drop** - Reorder items in lists
8. **Real-time Updates** - WebSocket for live price changes

## Demo Credentials

```
Email: admin@miprecio.com
Password: admin123
```
