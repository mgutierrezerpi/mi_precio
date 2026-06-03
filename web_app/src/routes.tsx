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
import { SettingsScreen } from './screens/admin/SettingsScreen'

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
        element: <MinimalLayout />,
        children: [
          {
            path: 'lists/:id',
            element: <ListEditScreen />,
          },
          {
            path: 'settings',
            element: <SettingsScreen />,
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
