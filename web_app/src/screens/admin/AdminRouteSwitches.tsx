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
