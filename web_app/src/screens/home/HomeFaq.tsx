import { useState } from 'react'
import { faqs, landingText } from './homeContent'
import { Plus } from './homeIcons'
import { Reveal, SectionHead } from './homeShared'

export function HomeFaq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="scroll-mt-24 bg-[#F5F3FF] px-5 py-24 md:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
        <SectionHead
          eyebrow={landingText(
            'Preguntas frecuentes',
            'Frequently asked questions'
          )}
          title={landingText(
            'Todo lo que necesitás saber.',
            'Everything you need to know.'
          )}
        />
        <Reveal className="mx-auto flex w-full max-w-[800px] flex-col gap-3.5">
          {faqs.map(([q, a], i) => {
            const isOpen = open === i
            return (
              <div
                key={q}
                className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 text-left text-base font-bold text-[#0F172A]"
                >
                  {q}
                  <Plus
                    size={20}
                    className={`shrink-0 text-[#7C3AED] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${isOpen ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="leading-relaxed text-[#475569]">{a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
