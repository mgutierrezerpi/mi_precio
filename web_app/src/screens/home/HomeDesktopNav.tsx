import { landingText, navLinks } from './homeContent'
import type { OpenAuth } from './homeTypes'

export function HomeDesktopNav({
  onAuth,
  isAuthenticated,
}: {
  onAuth: OpenAuth
  isAuthenticated: boolean
}) {
  return (
    <div className="hidden items-center gap-7 lg:flex">
      <nav className="flex items-center gap-6 text-sm font-medium text-[#475569]">
        {navLinks.map(([href, label]) => (
          <a key={href} href={href} className="hover:text-[#7C3AED]">
            {label}
          </a>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onAuth}
          className="landing-secondary-action cursor-pointer whitespace-nowrap rounded-[10px] border-[1.5px] border-[#7C3AED] px-[18px] py-2.5 text-sm font-bold text-[#7C3AED] hover:bg-[#F5F3FF]"
        >
          {isAuthenticated
            ? landingText('Mi panel', 'My dashboard')
            : landingText('Iniciar sesión', 'Sign in')}
        </button>
        {!isAuthenticated && (
          <button
            type="button"
            onClick={onAuth}
            className="landing-primary-action cursor-pointer whitespace-nowrap rounded-[10px] bg-gradient-to-br from-[#7C3AED] to-[#A855F7] px-[18px] py-2.5 text-sm font-semibold text-white hover:brightness-105"
          >
            {landingText('Probar 14 días gratis', 'Start 14-day free trial')}
          </button>
        )}
      </div>
    </div>
  )
}
