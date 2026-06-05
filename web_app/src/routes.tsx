import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MinimalLayout } from './components/MinimalLayout'
import { HomeScreen } from './screens/home/HomeScreen'
import { OldLandingScreen } from './screens/home/OldLandingScreen'
import { MenuScreen } from './screens/menu/MenuScreen'
import { LoginScreen } from './screens/admin/LoginScreen'
import { DashboardScreen } from './screens/admin/DashboardScreen'
import { PriceListsScreen } from './screens/admin/PriceListsScreen'
import { ListEditScreen } from './screens/admin/ListEditScreen'
import { ProductsScreen } from './screens/admin/ProductsScreen'
import { CategoriesScreen } from './screens/admin/CategoriesScreen'
import { CodesScreen } from './screens/admin/CodesScreen'
import { CustomersScreen } from './screens/admin/CustomersScreen'
import { ReportsScreen } from './screens/admin/ReportsScreen'
import { TeamScreen } from './screens/admin/TeamScreen'
import { SettingsCrmScreen } from './screens/admin/SettingsCrmScreen'

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
    element: <LoginScreen />,
  },
  // Admin routes
  {
    path: '/admin',
    children: [
      {
        index: true,
        element: <DashboardScreen />,
      },
      {
        path: 'items',
        element: <ProductsScreen />,
      },
      {
        path: 'categories',
        element: <CategoriesScreen />,
      },
      {
        path: 'lists',
        element: <PriceListsScreen />,
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
        element: <SettingsCrmScreen />,
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
