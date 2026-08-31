import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { AdminExperienceLayout } from './components/AdminExperienceLayout'
import { MinimalLayout } from './components/MinimalLayout'
import { CategoriesScreen } from './screens/admin/CategoriesScreen'
import { CodesScreen } from './screens/admin/CodesScreen'
import { CustomersScreen } from './screens/admin/CustomersScreen'
import { DeveloperPortalScreen } from './screens/admin/DeveloperPortalScreen'
import { LeadsScreen } from './screens/admin/LeadsScreen'
import { ListCustomizeScreen } from './screens/admin/ListCustomizeScreen'
import { ListEditScreen } from './screens/admin/ListEditScreen'
import { LinksScreen } from './screens/admin/LinksScreen'
import { MagazineEditScreen } from './screens/admin/MagazineEditScreen'
import { MagazinesScreen } from './screens/admin/MagazinesScreen'
import { ReportsScreen } from './screens/admin/ReportsScreen'
import { SupportScreen } from './screens/admin/SupportScreen'
import { TeamScreen } from './screens/admin/TeamScreen'
import {
  AdminDashboardRoute,
  AdminListsRoute,
  AdminProductsRoute,
  AdminSettingsRoute,
} from './screens/admin/AdminRouteSwitches'

export const adminRoute: RouteObject = {
  path: '/admin',
  element: <AdminExperienceLayout />,
  children: [
    { index: true, element: <AdminDashboardRoute /> },
    { path: 'items', element: <AdminProductsRoute /> },
    { path: 'categories', element: <CategoriesScreen /> },
    { path: 'lists', element: <AdminListsRoute /> },
    { path: 'lists/:id/customize', element: <ListCustomizeScreen /> },
    { path: 'links', element: <LinksScreen /> },
    { path: 'magazines', element: <MagazinesScreen /> },
    { path: 'magazines/:magazineId/edit', element: <MagazineEditScreen /> },
    { path: 'qr', element: <CodesScreen /> },
    { path: 'customers', element: <CustomersScreen /> },
    { path: 'leads', element: <LeadsScreen /> },
    { path: 'reports', element: <ReportsScreen /> },
    { path: 'team', element: <TeamScreen /> },
    { path: 'support', element: <SupportScreen /> },
    { path: 'clientes', element: <Navigate to="/admin/customers" replace /> },
    { path: 'reportes', element: <Navigate to="/admin/reports" replace /> },
    { path: 'equipo', element: <Navigate to="/admin/team" replace /> },
    { path: 'soporte', element: <Navigate to="/admin/support" replace /> },
    { path: 'settings', element: <AdminSettingsRoute /> },
    { path: 'developer', element: <DeveloperPortalScreen /> },
    {
      element: <MinimalLayout />,
      children: [{ path: 'lists/:id', element: <ListEditScreen /> }],
    },
    { path: '*', element: <Navigate to="/admin" replace /> },
  ],
}
