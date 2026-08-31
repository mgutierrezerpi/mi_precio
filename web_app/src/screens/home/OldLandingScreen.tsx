import { ThemeToggle } from '../../components/ThemeToggle'
import { useTheme } from '../../hooks/useTheme'
import { useAppSelector } from '../../store/hooks'
import { selectIsAuthenticated } from '../../store/slices/authSlice'
import { OldLandingCta, OldLandingFooter } from './OldLandingFooter'
import { OldLandingHero } from './OldLandingHero'
import { OldLandingIntegrations } from './OldLandingIntegrations'
import { OldLandingWorkflow } from './OldLandingWorkflow'
export function OldLandingScreen() {
  useTheme()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const appLink = isAuthenticated ? '/admin' : '/login'
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col transition-colors">
      <header className="absolute top-0 right-0 p-4 z-10">
        <ThemeToggle />
      </header>
      <OldLandingHero appLink={appLink} isAuthenticated={isAuthenticated} />
      <OldLandingWorkflow />
      <OldLandingIntegrations />
      <OldLandingCta appLink={appLink} ArrowIcon={ArrowIcon} />
      <OldLandingFooter />
    </div>
  )
}
function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
      />
    </svg>
  )
}
export default OldLandingScreen
