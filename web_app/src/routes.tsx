import { createBrowserRouter } from 'react-router-dom'
import { adminRoute } from './adminRoutes'
import { publicRoutes } from './publicRoutes'

const fallbackRoute = publicRoutes.at(-1)!
const primaryPublicRoutes = publicRoutes.slice(0, -1)

export const router = createBrowserRouter([
  ...primaryPublicRoutes,
  adminRoute,
  fallbackRoute,
])
