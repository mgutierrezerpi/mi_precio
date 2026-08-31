import type { CSSProperties } from 'react'

type Translate = (key: string) => string

export function LeadFormThanks({
  t,
  shell,
}: {
  t: Translate
  shell: CSSProperties
}) {
  return (
    <section
      data-no-export
      className="mt-12 w-full rounded-3xl px-6 py-16 text-center"
      style={shell}
    >
      <p className="text-[28px] font-bold md:text-[34px]">
        {t('lead.thanksTitle')}
      </p>
      <p className="mt-3 text-[16px] opacity-70 md:text-[18px]">
        {t('lead.thanksBody')}
      </p>
    </section>
  )
}
