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
| `/admin` | DashboardScreen | Admin dashboard |
| `/admin/lists` | ListsScreen | Manage price lists |
| `/admin/items` | ItemsScreen | Manage menu items |

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
