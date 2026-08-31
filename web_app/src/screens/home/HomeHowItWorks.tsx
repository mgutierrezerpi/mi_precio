import { landingText, steps } from './homeContent'
import { Reveal, SectionHead } from './homeShared'
import { HomeMobileCarousel } from './HomeFeatures'

export function StepCard({
  number,
  title,
  desc,
}: {
  number: string
  title: string
  desc: string
}) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-[0_6px_20px_-8px_rgba(15,23,42,0.08)]">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-2xl font-extrabold text-white shadow-[0_8px_18px_-4px_rgba(124,58,237,0.4)]">
        {number}
      </div>
      <h3 className="text-xl font-bold text-[#0F172A]">{title}</h3>
      <p className="leading-relaxed text-[#475569]">{desc}</p>
    </article>
  )
}

export function HomeHowItWorks() {
  return (
    <section className="bg-[#EDE9FE] px-5 py-24 md:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12">
        <SectionHead
          eyebrow={landingText('Cómo funciona', 'How it works')}
          title={landingText('Empezá en 3 pasos.', 'Get started in 3 steps.')}
          eyebrowColor="text-[#6D28D9]"
        />

        {/* Desktop: 3-column grid */}
        <Reveal className="hidden gap-6 md:grid md:grid-cols-3">
          {steps.map(([number, title, desc]) => (
            <StepCard key={number} number={number} title={title} desc={desc} />
          ))}
        </Reveal>

        {/* Mobile: auto-advancing carousel */}
        <HomeMobileCarousel>
          {steps.map(([number, title, desc]) => (
            <StepCard key={number} number={number} title={title} desc={desc} />
          ))}
        </HomeMobileCarousel>
      </div>
    </section>
  )
}
