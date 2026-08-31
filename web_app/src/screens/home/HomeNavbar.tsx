import { useEffect, useState } from 'react'
import { localeForHostname } from '../../lib/domainLocale'
import { landingText } from './homeContent'
import { HomeDesktopNav } from './HomeDesktopNav'
import { HomeMobileNav } from './HomeMobileNav'
import type { OpenAuth } from './homeTypes'

export function HomeNavbar({
  onAuth,
  isAuthenticated,
}: {
  onAuth: OpenAuth
  isAuthenticated: boolean
}) {
  const [open, setOpen] = useState(false)
  const isEnglishLanding = localeForHostname() === 'en'

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const sync = () => mql.matches && setOpen(false)
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) =>
      event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-xl">
      <div className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 md:px-8">
        <a
          href="#"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          {isEnglishLanding ? (
            <span
              className="flex items-center gap-2.5 text-[25px] font-extrabold tracking-[-0.05em] text-white"
              aria-label="PricePanel"
            >
              <span className="h-11 w-11 overflow-hidden" aria-hidden="true">
                <img
                  src="/miprecio-logo-white-pencil.webp"
                  alt=""
                  className="h-11 max-w-none w-auto"
                />
              </span>
              PricePanel
            </span>
          ) : (
            <img
              src="/miprecio-logo-white-pencil.webp"
              alt="MiPrecio"
              className="h-11 w-auto"
            />
          )}
        </a>
        <HomeDesktopNav onAuth={onAuth} isAuthenticated={isAuthenticated} />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={
            open
              ? landingText('Cerrar menú', 'Close menu')
              : landingText('Abrir menú', 'Open menu')
          }
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#0F172A] hover:bg-[#F5F3FF] lg:hidden"
        >
          {open ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          )}
        </button>
      </div>
      {open && (
        <HomeMobileNav
          onAuth={onAuth}
          isAuthenticated={isAuthenticated}
          onClose={() => setOpen(false)}
        />
      )}
    </header>
  )
}
