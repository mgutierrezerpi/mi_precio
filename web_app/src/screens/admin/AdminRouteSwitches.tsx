import { useAppSelector } from '../../store/hooks'
import { selectAdminUiMode } from '../../store/slices/authSlice'
import { DashboardScreen } from './DashboardScreen'
import { PriceListsScreen } from './PriceListsScreen'
import { ProductsScreen } from './ProductsScreen'
import { ListsScreen } from './ListsScreen'
import { CompactListsScreen } from './CompactListsScreen'
import { SettingsScreen } from './SettingsScreen'
import { SettingsCrmScreen } from './SettingsCrmScreen'
import { SimpleDashboardScreen } from './SimpleDashboardScreen'
import { SimpleProductsScreen } from './SimpleProductsScreen'

export function AdminDashboardRoute() {
  return useAppSelector(selectAdminUiMode) === 'full' ? <DashboardScreen /> : <SimpleDashboardScreen />
}

export function AdminProductsRoute() {
  return useAppSelector(selectAdminUiMode) === 'full' ? <ProductsScreen /> : <SimpleProductsScreen />
}

export function AdminListsRoute() {
  const mode = useAppSelector(selectAdminUiMode)
  if (mode === 'simple') return <ListsScreen />
  if (mode === 'medium') return <CompactListsScreen />
  return <PriceListsScreen />
}

export function AdminSettingsRoute() {
  return useAppSelector(selectAdminUiMode) === 'full' ? <SettingsCrmScreen /> : <SettingsScreen />
}
