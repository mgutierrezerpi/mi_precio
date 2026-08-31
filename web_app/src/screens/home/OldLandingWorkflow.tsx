import {
  OldLandingFeatureSection,
  OldLandingFormatCard,
} from './OldLandingFeatureSection'

const STEPS = [
  [
    'I',
    'Sube tu lista',
    'Arrastra fotos, PDFs o archivos Excel con tus precios.',
  ],
  ['II', 'Personaliza', 'Ajusta colores, logo y organiza tus productos.'],
  ['III', 'Comparte', 'Genera tu código QR único para tus clientes.'],
  [
    'IV',
    'Actualiza',
    'Modifica precios cuando quieras, se reflejan al instante.',
  ],
]
const IMPORT_DESCRIPTION = [
  'No importa el formato que uses actualmente. Acepta fotos de tu lista, archivos PDF o hojas de Excel.',
  'Nuestra tecnología extrae los precios automáticamente.',
].join(' ')
const ACCESS_DESCRIPTION = [
  'Crea listas privadas con acceso restringido para clientes especiales.',
  'Gestiona precios diferenciados para mayoristas y minoristas desde un solo lugar.',
].join(' ')
const STEP_NUMBER_CLASS = [
  'inline-flex items-center justify-center w-12 h-12 border border-[var(--color-accent)]',
  'text-[var(--color-accent)] text-xl rounded-full',
].join(' ')

export function OldLandingWorkflow() {
  return (
    <>
      <section
        id="como_funciona"
        className="border-t border-[var(--color-border)] py-24 px-6 bg-[var(--color-bg-secondary)]"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[var(--color-accent)] text-sm tracking-[0.3em] uppercase">
              Proceso simple
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-light text-[var(--color-text-primary)]">
              ¿Cómo funciona?
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map(([number, title, description]) => (
              <Step
                key={number}
                number={number}
                title={title}
                description={description}
              />
            ))}
          </div>
        </div>
      </section>
      <OldLandingFeatureSection
        eyebrow="Importación flexible"
        title="Sube tus precios como prefieras"
        description={IMPORT_DESCRIPTION}
      >
        <OldLandingFormatCard
          icon="◉"
          title="Fotos"
          description="JPG, PNG, HEIC"
        />
        <OldLandingFormatCard icon="▤" title="Documentos" description="PDF" />
        <OldLandingFormatCard
          icon="▦"
          title="Hojas de cálculo"
          description="Excel, CSV"
        />
      </OldLandingFeatureSection>
      <OldLandingFeatureSection
        dark
        eyebrow="Control total"
        title="Listas protegidas y precios mayoristas"
        description={ACCESS_DESCRIPTION}
      >
        <OldLandingFormatCard
          icon="☉"
          title="Lista Pública"
          description="Visible para todos"
        />
        <OldLandingFormatCard
          icon="◈"
          title="Lista Mayorista"
          description="Acceso con código"
          highlighted
        />
        <OldLandingFormatCard
          icon="❖"
          title="Lista VIP"
          description="Clientes selectos"
        />
      </OldLandingFeatureSection>
    </>
  )
}

function Step({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <span className={STEP_NUMBER_CLASS}>{number}</span>
      <h3 className="mt-4 text-lg text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-2 text-[var(--color-text-muted)] text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
}
