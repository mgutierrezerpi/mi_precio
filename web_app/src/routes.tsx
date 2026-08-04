import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MinimalLayout } from './components/MinimalLayout'
import { AdminExperienceLayout } from './components/AdminExperienceLayout'
import { HomeScreen } from './screens/home/HomeScreen'
import { OldLandingScreen } from './screens/home/OldLandingScreen'
import { MenuScreen } from './screens/menu/MenuScreen'

import { ListEditScreen } from './screens/admin/ListEditScreen'
import { CategoriesScreen } from './screens/admin/CategoriesScreen'
import { CodesScreen } from './screens/admin/CodesScreen'
import { CustomersScreen } from './screens/admin/CustomersScreen'
import { ReportsScreen } from './screens/admin/ReportsScreen'
import { TeamScreen } from './screens/admin/TeamScreen'
import { SupportScreen } from './screens/admin/SupportScreen'
import { AdminDashboardRoute, AdminListsRoute, AdminProductsRoute, AdminSettingsRoute } from './screens/admin/AdminRouteSwitches'
import { ChoosePlanScreen } from './screens/onboarding/ChoosePlanScreen'

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
    path: '/p/:subdomain',
    element: <MenuScreen />,
  },
  {
    path: '/p/:subdomain/:listId',
    element: <MenuScreen />,
  },
  {
    path: '/login',
    element: <HomeScreen />,
  },
  // Blocking plan selection: where a new signup lands until it has a plan.
  {
    path: '/planes',
    element: <ChoosePlanScreen />,
  },
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
        path: 'qr',
        element: <CodesScreen />,
      },
      {
        path: 'clientes',
        element: <CustomersScreen />,
      },
      {
        path: 'reportes',
        element: <ReportsScreen />,
      },
      {
        path: 'equipo',
        element: <TeamScreen />,
      },
      {
        path: 'soporte',
        element: <SupportScreen />,
      },
      {
        path: 'settings',
        element: <AdminSettingsRoute />,
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
