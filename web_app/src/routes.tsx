import { createBrowserRouter } from 'react-router-dom'
import { adminRoute } from './adminRoutes'
import { RouteErrorScreen } from './components/RouteErrorScreen'
import { publicRoutes } from './publicRoutes'

const fallbackRoute = publicRoutes.at(-1)!
const primaryPublicRoutes = publicRoutes.slice(0, -1)

export const router = createBrowserRouter([
  {
    // One boundary for every screen, so a render error never reaches React
    // Router's developer page.
    errorElement: <RouteErrorScreen />,
    children: [...primaryPublicRoutes, adminRoute, fallbackRoute],
  },
])
