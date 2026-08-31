import type { TFn } from '../../lib/i18n'

export function ProductScreenHeading({ t }: { t: TFn }) {
  return (
    <section className="flex min-h-[60px] flex-col justify-center gap-1">
      <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">
        {t('products.title')}
      </h1>
      <p className="text-[13px] text-[#9694A6]">{t('products.subtitle')}</p>
    </section>
  )
}
