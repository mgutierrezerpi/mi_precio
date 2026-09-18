import { Link } from 'react-router-dom'
import { localeForHostname } from '../../lib/domainLocale'
import { LEGAL_CONTACT_EMAIL } from '../legal/legalDocs'

const linkClass = 'text-[13px] font-medium text-[#94A3B8] hover:text-white'

// Brand/nav/socials columns are intentionally omitted for now — those pages
// don't exist yet. The full markup lives in the static landing
// (landing/index.html); restore from there when the links are ready.
export function LandingFooter() {
  const english = localeForHostname() === 'en'

  return (
    <footer className="bg-[#2E1065] px-5 py-8 text-white md:px-[120px]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5">
        <nav
          aria-label={english ? 'Legal' : 'Legales'}
          className="flex flex-wrap justify-center gap-x-6 gap-y-2"
        >
          <Link to="/terminos" className={linkClass}>
            {english ? 'Terms' : 'Términos'}
          </Link>
          <Link to="/privacidad" className={linkClass}>
            {english ? 'Privacy' : 'Privacidad'}
          </Link>
          <Link to="/cookies" className={linkClass}>
            Cookies
          </Link>
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className={linkClass}>
            {english ? 'Contact' : 'Contacto'}
          </a>
        </nav>
        <p className="text-center text-xs font-medium text-[#64748B]">
          {english
            ? '© 2026 PricePanel. All rights reserved.'
            : '© 2026 MiPrecio. Todos los derechos reservados.'}
        </p>
      </div>
    </footer>
  )
}
