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
