import { useEffect, useState } from 'react'
import { CrmSidebar } from './CrmSidebar'
import { CrmTopbar } from './CrmTopbar'

interface CrmLayoutProps {
  active: string
  title: string
  subtitle: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: (value: string) => void
  actions?: React.ReactNode
  hideContext?: boolean
  children: React.ReactNode
}

/** Full CRM screen shell: themed background + sidebar + topbar + scrollable content. */
export function CrmLayout({
  active,
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  actions,
  hideContext,
  children,
}: CrmLayoutProps) {
  const [navOpen, setNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) setSidebarCollapsed(false)
      setNavOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const toggleSidebar = () => {
    if (window.matchMedia('(min-width: 1024px)').matches)
      setSidebarCollapsed((value) => !value)
    else setNavOpen(true)
  }
  return (
    <div className="dash flex h-screen overflow-hidden bg-[var(--dash-bg)] font-sans text-[var(--dash-text)]">
      <CrmSidebar
        active={active}
        open={navOpen}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onClose={() => setNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <CrmTopbar
          title={title}
          subtitle={subtitle}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          actions={actions}
          hideContext={hideContext}
          onMenu={() => setNavOpen(true)}
        />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
