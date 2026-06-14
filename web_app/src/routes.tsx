import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MinimalLayout } from './components/MinimalLayout'
import { AdminExperienceLayout } from './components/SimpleAdminLayout'
import { HomeScreen } from './screens/home/HomeScreen'
import { OldLandingScreen } from './screens/home/OldLandingScreen'
import { MenuScreen } from './screens/menu/MenuScreen'
import { ListEditScreen } from './screens/admin/ListEditScreen'
import { CategoriesScreen } from './screens/admin/CategoriesScreen'
import { CodesScreen } from './screens/admin/CodesScreen'
import { CustomersScreen } from './screens/admin/CustomersScreen'
import { ReportsScreen } from './screens/admin/ReportsScreen'
import { TeamScreen } from './screens/admin/TeamScreen'
import { AdminDashboardRoute, AdminListsRoute, AdminProductsRoute, AdminSettingsRoute } from './screens/admin/AdminRouteSwitches'

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
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
