const ROWS = [
  ['Google Maps', 'Importa datos de tu negocio', '●'],
  ['LinkedIn', 'Perfil empresarial', 'in'],
  ['Facebook', 'Optimiza tu página', 'f'],
  ['Instagram', 'Comparte tu lista', '◎'],
]
const CARD_CLASS = [
  'p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded',
  'hover:border-[var(--color-accent)] transition-colors text-center',
].join(' ')
export function OldLandingIntegrations() {
  return (
    <section className="border-t border-[var(--color-border)] py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <span className="text-[var(--color-accent)] text-sm tracking-[0.3em] uppercase">
          Integraciones
        </span>
        <h2 className="mt-4 text-3xl md:text-4xl font-light text-[var(--color-text-primary)]">
          Conectado con tus herramientas
        </h2>
        <p className="mt-6 text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
          Importa información de tu negocio automáticamente y optimiza tu
          presencia en redes sociales.
        </p>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {ROWS.map(([name, description, icon]) => (
            <div key={name} className={CARD_CLASS}>
              <div className="text-[var(--color-accent)] w-8 h-8 mx-auto">
                {icon}
              </div>
              <h4 className="mt-3 text-[var(--color-text-primary)]">{name}</h4>
              <p className="mt-1 text-[var(--color-text-muted)] text-xs">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
