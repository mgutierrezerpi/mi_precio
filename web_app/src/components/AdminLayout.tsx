import { Outlet, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectTenant } from '../store/slices/authSlice'
import { selectMobileMenuOpen, toggleMobileMenu, toggleSidebar } from '../store/slices/uiSlice'
import { useTheme } from '../hooks/useTheme'
import { AdminHeader } from './AdminLayoutHeader'
import { DesktopSidebar, MobileSidebar } from './AdminLayoutSidebar'

export function AdminLayout() {
  const dispatch = useAppDispatch()
  const mobileMenuOpen = useAppSelector(selectMobileMenuOpen)
  const tenant = useAppSelector(selectTenant)
  const location = useLocation()

  useTheme()

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] transition-colors font-sans">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => dispatch(toggleMobileMenu())} />
      )}
      <MobileSidebar open={mobileMenuOpen} name={tenant?.name} pathname={location.pathname} onClose={() => dispatch(toggleMobileMenu())} />
      <DesktopSidebar name={tenant?.name} subdomain={tenant?.subdomain} pathname={location.pathname} />
      <div className="lg:pl-64">
        <AdminHeader onMobileToggle={() => dispatch(toggleMobileMenu())} onDesktopToggle={() => dispatch(toggleSidebar())} />
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}

export default AdminLayout
