import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MinimalLayout } from './components/MinimalLayout'
import { HomeScreen } from './screens/home/HomeScreen'
import { MenuScreen } from './screens/menu/MenuScreen'
import { LoginScreen } from './screens/admin/LoginScreen'
import { DashboardScreen } from './screens/admin/DashboardScreen'
import { ListsScreen } from './screens/admin/ListsScreen'
import { ListEditScreen } from './screens/admin/ListEditScreen'
import { ItemsScreen } from './screens/admin/ItemsScreen'
import { SettingsScreen } from './screens/admin/SettingsScreen'

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <HomeScreen />,
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
        element: <MinimalLayout />,
        children: [
          {
            path: 'lists',
            element: <ListsScreen />,
          },
          {
            path: 'lists/:id',
            element: <ListEditScreen />,
          },
          {
            path: 'items',
            element: <ItemsScreen />,
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
