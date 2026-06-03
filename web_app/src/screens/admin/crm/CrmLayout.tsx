import { CrmSidebar } from './CrmSidebar'
import { CrmTopbar } from './CrmTopbar'

interface CrmLayoutProps {
  active: string
  title: string
  subtitle: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  actions?: React.ReactNode
  children: React.ReactNode
}

/** Full CRM screen shell: themed background + sidebar + topbar + scrollable content. */
export function CrmLayout({ active, title, subtitle, searchPlaceholder, searchValue, onSearchChange, actions, children }: CrmLayoutProps) {
  return (
    <div className="dash flex h-screen overflow-hidden bg-[var(--dash-bg)] font-sans text-[var(--dash-text)]">
      <CrmSidebar active={active} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <CrmTopbar title={title} subtitle={subtitle} searchPlaceholder={searchPlaceholder} searchValue={searchValue} onSearchChange={onSearchChange} actions={actions} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
