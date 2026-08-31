import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { LinkTreeScreen } from './screens/home/LinkTreeScreen'
import { HomeScreen } from './screens/home/HomeScreen'
import { OldLandingScreen } from './screens/home/OldLandingScreen'
import { TemplatePreviewScreen } from './screens/home/TemplatePreviewScreen'
import { MarketplaceScreen } from './screens/marketplace/MarketplaceScreen'
import { LinkTreePublicScreen } from './screens/menu/LinkTreePublicScreen'
import { MagazineScreen } from './screens/menu/MagazineScreen'
import { MenuScreen } from './screens/menu/MenuScreen'
import { ChoosePlanScreen } from './screens/onboarding/ChoosePlanScreen'

export const publicRoutes: RouteObject[] = [
  { path: '/', element: <HomeScreen /> },
  { path: '/old_landing', element: <OldLandingScreen /> },
  { path: '/marketplace', element: <MarketplaceScreen /> },
  { path: '/linktree', element: <LinkTreeScreen /> },
  { path: '/l/:subdomain', element: <LinkTreePublicScreen /> },
  { path: '/p/:subdomain', element: <MenuScreen /> },
  { path: '/p/:subdomain/:listId', element: <MenuScreen /> },
  { path: '/m/:subdomain/:magazineId', element: <MagazineScreen /> },
  { path: '/login', element: <HomeScreen /> },
  { path: '/template-preview/:variant', element: <TemplatePreviewScreen /> },
  { path: '/plans', element: <ChoosePlanScreen /> },
  { path: '/planes', element: <Navigate to="/plans" replace /> },
  { path: '/reports', element: <Navigate to="/admin/reports" replace /> },
  { path: '*', element: <Navigate to="/" replace /> },
]
