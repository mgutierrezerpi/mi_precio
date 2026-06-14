import { useAppSelector } from '../../store/hooks'
import { selectSimpleAdminUi } from '../../store/slices/authSlice'
import { DashboardScreen } from './DashboardScreen'
import { PriceListsScreen } from './PriceListsScreen'
import { ProductsScreen } from './ProductsScreen'
import { ListsScreen } from './ListsScreen'
import { SettingsScreen } from './SettingsScreen'
import { SettingsCrmScreen } from './SettingsCrmScreen'
import { SimpleDashboardScreen } from './SimpleDashboardScreen'
import { SimpleProductsScreen } from './SimpleProductsScreen'

export function AdminDashboardRoute() {
  return useAppSelector(selectSimpleAdminUi) ? <SimpleDashboardScreen /> : <DashboardScreen />
}

export function AdminProductsRoute() {
  return useAppSelector(selectSimpleAdminUi) ? <SimpleProductsScreen /> : <ProductsScreen />
}

export function AdminListsRoute() {
  return useAppSelector(selectSimpleAdminUi) ? <ListsScreen /> : <PriceListsScreen />
}

export function AdminSettingsRoute() {
  return useAppSelector(selectSimpleAdminUi) ? <SettingsScreen /> : <SettingsCrmScreen />
}
