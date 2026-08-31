import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

const FOOTER_ROW =
  'max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4'
const CTA_PRIMARY = [
  'group inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-accent)]',
  'text-[var(--color-bg-primary)] font-medium tracking-wide',
  'hover:bg-[var(--color-accent-hover)] transition-colors',
].join(' ')
const CTA_LINK = [
  'inline-flex items-center gap-2 px-8 py-4 border border-[var(--color-border-light)]',
  'text-[var(--color-text-secondary)] font-medium tracking-wide',
  'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors',
].join(' ')

export function OldLandingFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] py-12 px-6">
      <div className={FOOTER_ROW}>
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Mi Precio" className="h-10 logo-adaptive" />
          <p className="text-[var(--color-text-muted)] text-sm">
            La forma más elegante de compartir tus precios.
          </p>
        </div>
        <p className="text-[var(--color-text-muted)] text-sm">
          © {new Date().getFullYear()} Mi Precio. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export function OldLandingCta({
  appLink,
  ArrowIcon,
}: {
  appLink: string
  ArrowIcon: ({ className }: { className?: string }) => ReactNode
}) {
  return (
    <section className="border-t border-[var(--color-border)] py-24 px-6 bg-[var(--color-bg-secondary)]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-light text-[var(--color-text-primary)]">
          Empieza hoy mismo
        </h2>
        <p className="mt-6 text-[var(--color-text-muted)] text-lg leading-relaxed">
          Únete a los negocios que ya confían en Mi Precio para compartir sus
          listas de precios de forma elegante.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={appLink} className={CTA_PRIMARY}>
            Crear cuenta gratis{' '}
            <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/p/demo" className={CTA_LINK}>
            Ver demo
          </Link>
        </div>
      </div>
    </section>
  )
}
