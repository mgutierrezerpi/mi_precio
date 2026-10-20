import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import { DashboardScreen } from './DashboardScreen'
import { PriceListsScreen } from './PriceListsScreen'
import { ProductsScreen } from './ProductsScreen'
import { SettingsCrmScreen } from './SettingsCrmScreen'

export function AdminDashboardRoute() {
  return <DashboardScreen />
}

export function AdminProductsRoute() {
  return <ProductsScreen />
}

export function AdminListsRoute() {
  return <PriceListsScreen />
}

export function AdminSettingsRoute() {
  return <SettingsCrmScreen />
}

/** Magazines are behind a feature flag. The sidebar already hid them, but the
 *  URL still opened the screen, which showed an error and two «Nueva revista»
 *  buttons that could not work. */
export function MagazinesGate({ children }: { children: ReactNode }) {
  const tenant = useAppSelector(selectTenant)
  if (tenant && !tenant.features?.magazines)
    return <Navigate to="/admin" replace />
  return children
}
