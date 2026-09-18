import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { localeForHostname } from '../../lib/domainLocale'
import { LandingFooter } from '../home/LandingFooter'
import {
  LEGAL_DOCS,
  LEGAL_UPDATED_AT,
  type LegalBlock,
  type LegalSlug,
} from './legalDocs'

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') {
    return <p className="text-[15px] leading-relaxed text-[#475569]">{block}</p>
  }
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-[#475569]">
      {block.list.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

/** Public legal page (términos, privacidad, cookies), styled like the landing. */
export function LegalScreen({ slug }: { slug: LegalSlug }) {
  const doc = LEGAL_DOCS.find((d) => d.slug === slug)!
  // Same theme tokens as the landing and /admin.
  useTheme()
  const english = localeForHostname() === 'en'

  useEffect(() => {
    const prevTitle = document.title
    const prevLanguage = document.documentElement.lang
    document.title = `${doc.title} | MiPrecio`
    document.documentElement.lang = 'es'
    window.scrollTo(0, 0)
    return () => {
      document.title = prevTitle
      document.documentElement.lang = prevLanguage
    }
  }, [doc.title])

  return (
    <main className="dash landing-page flex min-h-screen flex-col bg-white font-sans text-slate-900">
      <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center">
            {english ? (
              <img src="/pricepanel-logo.png" alt="PricePanel" className="h-11 w-auto" />
            ) : (
              <span className="relative inline-flex h-11 overflow-hidden">
                <img src="/miprecio-logo-white-pencil.webp" alt="MiPrecio" className="h-11 w-auto" />
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-[30%] right-0 h-[25%] bg-white"
                />
              </span>
            )}
          </Link>
          <Link to="/" className="text-sm font-semibold text-[#7C3AED] hover:opacity-80">
            {english ? '← Back to home' : '← Volver al inicio'}
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1200px] flex-1 gap-10 px-5 py-12 md:px-8 lg:grid-cols-[240px_1fr] lg:py-16">
        <nav aria-label="Legales" className="flex flex-wrap gap-2 lg:sticky lg:top-28 lg:flex-col lg:self-start">
          {LEGAL_DOCS.map((d) => (
            <NavLink
              key={d.slug}
              to={`/${d.slug}`}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded-[10px] px-3.5 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-[#EDE9FE] text-[#7C3AED]'
                    : 'text-[#94A3B8] hover:bg-violet-50',
                ].join(' ')
              }
            >
              {d.navLabel}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0 max-w-[760px]">
          {english && (
            <p className="mb-8 rounded-[12px] border border-[#7C3AED] bg-[#EDE9FE] px-4 py-3 text-sm text-slate-900">
              This document is currently available in Spanish only. The Spanish version is the one that applies.
            </p>
          )}
          <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-slate-900 md:text-[40px]">
            {doc.title}
          </h1>
          <p className="mt-3 text-sm font-medium text-[#94A3B8]">
            Última actualización: {LEGAL_UPDATED_AT}
          </p>
          <p className="mt-6 text-[17px] leading-relaxed text-[#334155]">{doc.intro}</p>

          <div className="mt-10 flex flex-col gap-10">
            {doc.sections.map((section) => (
              <div key={section.title} className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                {section.body.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <LandingFooter />
    </main>
  )
}

export default LegalScreen
