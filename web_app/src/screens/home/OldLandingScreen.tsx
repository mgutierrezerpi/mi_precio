import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useTheme } from '../../hooks/useTheme'
import { useAppSelector } from '../../store/hooks'
import { selectIsAuthenticated } from '../../store/slices/authSlice'

export function OldLandingScreen() {
  useTheme()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const appLink = isAuthenticated ? '/admin' : '/login'

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col transition-colors">
      <header className="absolute top-0 right-0 p-4 z-10">
        <ThemeToggle />
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 min-h-screen">
        <div className="text-center max-w-3xl">
          <div className="mb-8">
            <img src="/logo.svg" alt="Mi Precio" className="h-24 mx-auto logo-adaptive" />
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
            <span className="text-[var(--color-text-muted)]">Sin complicaciones.</span>
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => document.getElementById('como_funciona')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-[var(--color-accent)] text-[var(--color-bg-primary)] font-medium tracking-wide hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Más información
            </button>
            <Link
              to={appLink}
              className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--color-border-light)] text-[var(--color-text-secondary)] font-medium tracking-wide hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              {isAuthenticated ? 'Mi Panel' : 'Administrar'}
            </Link>
          </div>
        </div>
      </section>

      <section id="como_funciona" className="border-t border-[var(--color-border)] py-24 px-6 bg-[var(--color-bg-secondary)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[var(--color-accent)] text-sm tracking-[0.3em] uppercase">Proceso simple</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-light text-[var(--color-text-primary)]">
              ¿Cómo funciona?
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard number="I" title="Sube tu lista" description="Arrastra fotos, PDFs o archivos Excel con tus precios." />
            <StepCard number="II" title="Personaliza" description="Ajusta colores, logo y organiza tus productos." />
            <StepCard number="III" title="Comparte" description="Genera tu código QR único para tus clientes." />
            <StepCard number="IV" title="Actualiza" description="Modifica precios cuando quieras, se reflejan al instante." />
          </div>
        </div>
      </section>

      <FeatureSection
        eyebrow="Importación flexible"
        title="Sube tus precios como prefieras"
        description="No importa el formato que uses actualmente. Acepta fotos de tu lista, archivos PDF o hojas de Excel. Nuestra tecnología extrae los precios automáticamente."
      >
        <FormatCard icon="◉" title="Fotos" description="JPG, PNG, HEIC" />
        <FormatCard icon="▤" title="Documentos" description="PDF" />
        <FormatCard icon="▦" title="Hojas de cálculo" description="Excel, CSV" />
      </FeatureSection>

      <FeatureSection
        dark
        eyebrow="Control total"
        title="Listas protegidas y precios mayoristas"
        description="Crea listas privadas con acceso restringido para clientes especiales. Gestiona precios diferenciados para mayoristas y minoristas desde un solo lugar."
      >
        <FormatCard icon="☉" title="Lista Pública" description="Visible para todos" />
        <FormatCard icon="◈" title="Lista Mayorista" description="Acceso con código" highlighted />
        <FormatCard icon="❖" title="Lista VIP" description="Clientes selectos" />
      </FeatureSection>

      <section className="border-t border-[var(--color-border)] py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-[var(--color-accent)] text-sm tracking-[0.3em] uppercase">Integraciones</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-light text-[var(--color-text-primary)]">
            Conectado con tus herramientas
          </h2>
          <p className="mt-6 text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
            Importa información de tu negocio automáticamente y optimiza tu presencia en redes sociales.
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <IntegrationCard icon={<MapIcon />} name="Google Maps" description="Importa datos de tu negocio" />
            <IntegrationCard icon={<LinkedinIcon />} name="LinkedIn" description="Perfil empresarial" />
            <IntegrationCard icon={<FacebookIcon />} name="Facebook" description="Optimiza tu página" />
            <IntegrationCard icon={<InstagramIcon />} name="Instagram" description="Comparte tu lista" />
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] py-24 px-6 bg-[var(--color-bg-secondary)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-light text-[var(--color-text-primary)]">
            Empieza hoy mismo
          </h2>
          <p className="mt-6 text-[var(--color-text-muted)] text-lg leading-relaxed">
            Únete a los negocios que ya confían en Mi Precio para compartir sus listas de precios de forma elegante.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={appLink}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-accent)] text-[var(--color-bg-primary)] font-medium tracking-wide hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Crear cuenta gratis
              <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/p/demo"
              className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--color-border-light)] text-[var(--color-text-secondary)] font-medium tracking-wide hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              Ver demo
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Mi Precio" className="h-10 logo-adaptive" />
            <p className="text-[var(--color-text-muted)] text-sm">La forma más elegante de compartir tus precios.</p>
          </div>
          <p className="text-[var(--color-text-muted)] text-sm">
            © {new Date().getFullYear()} Mi Precio. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <span className="inline-flex items-center justify-center w-12 h-12 border border-[var(--color-accent)] text-[var(--color-accent)] text-xl rounded-full">
        {number}
      </span>
      <h3 className="mt-4 text-lg text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-2 text-[var(--color-text-muted)] text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function FeatureSection({ eyebrow, title, description, dark = false, children }: { eyebrow: string; title: string; description: string; dark?: boolean; children: ReactNode }) {
  return (
    <section className={`border-t border-[var(--color-border)] py-24 px-6 ${dark ? 'bg-[var(--color-bg-secondary)]' : ''}`}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-[var(--color-accent)] text-sm tracking-[0.3em] uppercase">{eyebrow}</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-light text-[var(--color-text-primary)] leading-tight">
            {title}
          </h2>
          <p className="mt-6 text-[var(--color-text-muted)] leading-relaxed">{description}</p>
        </div>
        <div className="flex justify-center">
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </section>
  )
}

function FormatCard({ icon, title, description, highlighted = false }: { icon: string; title: string; description: string; highlighted?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 bg-[var(--color-bg-card)] border ${highlighted ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'} rounded`}>
      <span className="text-[var(--color-accent)] text-2xl">{icon}</span>
      <div>
        <p className="text-[var(--color-text-primary)] text-sm">{title}</p>
        <p className="text-[var(--color-text-muted)] text-xs">{description}</p>
      </div>
    </div>
  )
}

function IntegrationCard({ icon, name, description }: { icon: ReactNode; name: string; description: string }) {
  return (
    <div className="p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded hover:border-[var(--color-accent)] transition-colors text-center">
      <div className="text-[var(--color-accent)] w-8 h-8 mx-auto">{icon}</div>
      <h4 className="mt-3 text-[var(--color-text-primary)]">{name}</h4>
      <p className="mt-1 text-[var(--color-text-muted)] text-xs">{description}</p>
    </div>
  )
}

function MapIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
}

function LinkedinIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
}

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" /></svg>
}

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg>
}

function ArrowIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
}

export default OldLandingScreen
