import { Link } from 'react-router-dom'

const HERO_ACTION = [
  'px-8 py-4 bg-[var(--color-accent)] text-[var(--color-bg-primary)] font-medium',
  'tracking-wide hover:bg-[var(--color-accent-hover)] transition-colors',
].join(' ')
const HERO_LINK = [
  'inline-flex items-center gap-2 px-8 py-4 border border-[var(--color-border-light)]',
  'text-[var(--color-text-secondary)] font-medium tracking-wide hover:border-[var(--color-accent)]',
  'hover:text-[var(--color-accent)] transition-colors',
].join(' ')

export function OldLandingHero({
  appLink,
  isAuthenticated,
}: {
  appLink: string
  isAuthenticated: boolean
}) {
  const scrollToHowItWorks = () =>
    document
      .getElementById('como_funciona')
      ?.scrollIntoView({ behavior: 'smooth' })
  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 min-h-screen">
      <div className="text-center max-w-3xl">
        <div className="mb-8">
          <img
            src="/logo.svg"
            alt="Mi Precio"
            className="h-24 mx-auto logo-adaptive"
          />
        </div>
        <p className="text-[var(--color-accent)] text-sm tracking-[0.3em] uppercase mb-6">
          Listas de precios digitales
        </p>
        <h1 className="text-6xl md:text-8xl font-light text-[var(--color-text-primary)] tracking-wide leading-none">
          Mi Precio
        </h1>
        <p className="mt-8 text-[var(--color-text-secondary)] text-lg md:text-xl font-light leading-relaxed">
          La forma más elegante de compartir tus precios.
          <br />
          <span className="text-[var(--color-text-muted)]">
            Sin complicaciones.
          </span>
        </p>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={scrollToHowItWorks}
            className={HERO_ACTION}
          >
            Más información
          </button>
          <Link to={appLink} className={HERO_LINK}>
            {isAuthenticated ? 'Mi Panel' : 'Administrar'}
          </Link>
        </div>
      </div>
    </section>
  )
}
