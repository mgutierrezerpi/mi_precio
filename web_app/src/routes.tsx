import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MinimalLayout } from './components/MinimalLayout'
import { AdminExperienceLayout } from './components/AdminExperienceLayout'
import { HomeScreen } from './screens/home/HomeScreen'
import { OldLandingScreen } from './screens/home/OldLandingScreen'
import { MenuScreen } from './screens/menu/MenuScreen'
import { MagazineScreen } from './screens/menu/MagazineScreen'
import { MarketplaceScreen } from './screens/marketplace/MarketplaceScreen'
import { LinkTreeScreen } from './screens/home/LinkTreeScreen'
import { LinkTreePublicScreen } from './screens/menu/LinkTreePublicScreen'

import { ListEditScreen } from './screens/admin/ListEditScreen'
import { ListCustomizeScreen } from './screens/admin/ListCustomizeScreen'
import { MagazinesScreen } from './screens/admin/MagazinesScreen'
import { MagazineEditScreen } from './screens/admin/MagazineEditScreen'
import { CategoriesScreen } from './screens/admin/CategoriesScreen'
import { CodesScreen } from './screens/admin/CodesScreen'
import { CustomersScreen } from './screens/admin/CustomersScreen'
import { LeadsScreen } from './screens/admin/LeadsScreen'
import { ReportsScreen } from './screens/admin/ReportsScreen'
import { TeamScreen } from './screens/admin/TeamScreen'
import { SupportScreen } from './screens/admin/SupportScreen'
import {
  AdminDashboardRoute,
  AdminListsRoute,
  AdminProductsRoute,
  AdminSettingsRoute,
} from './screens/admin/AdminRouteSwitches'
import { ChoosePlanScreen } from './screens/onboarding/ChoosePlanScreen'
import { DeveloperPortalScreen } from './screens/admin/DeveloperPortalScreen'
import { LinksScreen } from './screens/admin/LinksScreen'

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <HomeScreen />,
  },
  {
    path: '/old_landing',
    element: <OldLandingScreen />,
  },
  {
    path: '/marketplace',
    element: <MarketplaceScreen />,
  },
  {
    path: '/linktree',
    element: <LinkTreeScreen />,
  },
  {
    path: '/l/:subdomain',
    element: <LinkTreePublicScreen />,
  },
  {
    path: '/p/:subdomain',
    element: <MenuScreen />,
  },
  {
    path: '/p/:subdomain/:listId',
    element: <MenuScreen />,
  },
  {
    path: '/m/:subdomain/:magazineId',
    element: <MagazineScreen />,
  },
  {
    path: '/login',
    element: <HomeScreen />,
  },
  // Blocking plan selection: where a new signup lands until it has a plan.
  {
    path: '/plans',
    element: <ChoosePlanScreen />,
  },
  { path: '/planes', element: <Navigate to="/plans" replace /> },
  { path: '/reports', element: <Navigate to="/admin/reports" replace /> },
  // Admin routes
  {
    path: '/admin',
    element: <AdminExperienceLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboardRoute />,
      },
      {
        path: 'items',
        element: <AdminProductsRoute />,
      },
      {
        path: 'categories',
        element: <CategoriesScreen />,
      },
      {
        path: 'lists',
        element: <AdminListsRoute />,
      },
      {
        path: 'lists/:id/customize',
        element: <ListCustomizeScreen />,
      },
      {
        path: 'links',
        element: <LinksScreen />,
      },
      {
        path: 'magazines',
        element: <MagazinesScreen />,
      },
      {
        path: 'magazines/:magazineId/edit',
        element: <MagazineEditScreen />,
      },

      {
        path: 'qr',
        element: <CodesScreen />,
      },
      {
        path: 'customers',
        element: <CustomersScreen />,
      },
      {
        path: 'leads',
        element: <LeadsScreen />,
      },
      {
        path: 'reports',
        element: <ReportsScreen />,
      },
      {
        path: 'team',
        element: <TeamScreen />,
      },
      {
        path: 'support',
        element: <SupportScreen />,
      },
      { path: 'clientes', element: <Navigate to="/admin/customers" replace /> },
      { path: 'reportes', element: <Navigate to="/admin/reports" replace /> },
      { path: 'equipo', element: <Navigate to="/admin/team" replace /> },
      { path: 'soporte', element: <Navigate to="/admin/support" replace /> },
      {
        path: 'settings',
        element: <AdminSettingsRoute />,
      },
      {
        path: 'developer',
        element: <DeveloperPortalScreen />,
      },
      {
        element: <MinimalLayout />,
        children: [
          {
            path: 'lists/:id',
            element: <ListEditScreen />,
          },
        ],
      },
      // Unknown /admin/* path (e.g. a typo like /admin/customers): stay in the
      // panel instead of bouncing a logged-in user to the marketing landing.
      {
        path: '*',
        element: <Navigate to="/admin" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
