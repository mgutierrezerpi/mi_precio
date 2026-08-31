import { landingText, navLinks } from './homeContent'
import type { OpenAuth } from './homeTypes'

export function HomeMobileNav({
  onAuth,
  isAuthenticated,
  onClose,
}: {
  onAuth: OpenAuth
  isAuthenticated: boolean
  onClose: () => void
}) {
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={landingText('Cerrar menú', 'Close menu')}
        onClick={onClose}
        className="fixed inset-0 top-0 z-0 cursor-default"
      />
      <nav className="animate-fade-in-down absolute inset-x-0 top-full z-10 origin-top border-b border-[#E2E8F0] bg-white shadow-[0_18px_36px_-18px_rgba(15,23,42,0.25)]">
        <div className="mx-auto max-w-[1200px] px-5 py-4 md:px-8">
          <p className="px-1 pb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
            {landingText('Navegación', 'Navigation')}
          </p>
          <div className="flex flex-col gap-0.5">
            {navLinks.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={onClose}
                className="group flex items-center justify-between rounded-xl px-1 py-3 text-[15px] font-semibold text-[#334155] hover:text-[#7C3AED]"
              >
                {label}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#CBD5E1] transition-transform group-hover:translate-x-0.5 group-hover:text-[#7C3AED]"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            ))}
          </div>
          <div className="my-3 h-px bg-[#F1F5F9]" />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                onClose()
                onAuth()
              }}
              className={`${isAuthenticated ? 'w-full' : 'flex-1'} whitespace-nowrap rounded-xl border-[1.5px] border-[#7C3AED] px-3 py-3 text-sm font-bold text-[#7C3AED] hover:bg-[#F5F3FF]`}
            >
              {isAuthenticated
                ? landingText('Mi panel', 'My dashboard')
                : landingText('Iniciar sesión', 'Sign in')}
            </button>
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onAuth()
                }}
                className="flex-1 whitespace-nowrap rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] px-3 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(124,58,237,0.6)] hover:brightness-105"
              >
                {landingText(
                  'Probar 14 días gratis',
                  'Start 14-day free trial'
                )}
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}
