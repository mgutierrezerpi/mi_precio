import { LeadForm } from '../../components/LeadForm'
import type { Magazine, Tenant } from '../../types'

interface ContactMagazineProps {
  magazine: Magazine
  tenant: Tenant
}

export function ContactMagazine({ magazine, tenant }: ContactMagazineProps) {
  const page = magazine.pages[0]
  const content = page?.content
  const heading =
    typeof content?.heading === 'string'
      ? content.heading
      : page?.title || '¿Cómo podemos ayudarte?'
  const body =
    typeof content?.body === 'string'
      ? content.body
      : magazine.description || 'Dejanos tus datos y te respondemos a la brevedad.'
  const accent = tenant.brandColor || '#14532D'

  return (
    <main className="min-h-screen bg-[#F6F4EE] px-5 py-10 text-[#1D2A20] sm:px-8 sm:py-16">
      <section className="mx-auto max-w-3xl">
        <p className="mb-5 text-center text-xs font-semibold tracking-[0.2em] text-[#52705A] uppercase">
          {tenant.name}
        </p>
        <h1 className="mx-auto max-w-xl text-center font-serif text-4xl leading-tight sm:text-5xl">
          {heading}
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-center text-base leading-7 text-[#5E6B61]">
          {body}
        </p>
        <div className="mt-10">
          <LeadForm
            tenant={tenant}
            listName="Contacto"
            ink="#1D2A20"
            accent={accent}
            alwaysOpen
            source="contact"
          />
        </div>
      </section>
    </main>
  )
}
