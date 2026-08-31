import type { TFn } from '../../lib/i18n'
import { Field, inputClass } from './MagazineEditorFields'
import type { MagazinePageDraft } from './magazineEditorTypes'

export function PageContentFields({
  draft,
  update,
  t,
}: {
  draft: MagazinePageDraft
  update: <K extends keyof MagazinePageDraft>(key: K, value: MagazinePageDraft[K]) => void
  t: TFn
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={t('magazines.pageTemplate')}>
        <input value={draft.pageType} onChange={(event) => update('pageType', event.target.value)} className={inputClass} placeholder={t('magazines.pageTemplatePlaceholder')} />
      </Field>
      <Field label={t('magazines.pageTitle')}>
        <input value={draft.title} onChange={(event) => update('title', event.target.value)} className={inputClass} placeholder={t('magazines.pageTitlePlaceholder')} />
      </Field>
      <Field label={t('magazines.pageEyebrow')}>
        <input value={draft.eyebrow} onChange={(event) => update('eyebrow', event.target.value)} className={inputClass} placeholder={t('magazines.pageEyebrowPlaceholder')} />
      </Field>
      <Field label={t('magazines.pageHeadline')}>
        <input value={draft.headline} onChange={(event) => update('headline', event.target.value)} className={inputClass} placeholder={t('magazines.pageHeadlinePlaceholder')} />
      </Field>
      <Field label={t('magazines.pageBody')}>
        <textarea value={draft.body} onChange={(event) => update('body', event.target.value)} className={`${inputClass} min-h-36 resize-y sm:col-span-2`} placeholder={t('magazines.pageBodyPlaceholder')} />
      </Field>
      <Field label={t('magazines.pageQuote')}>
        <textarea value={draft.quote} onChange={(event) => update('quote', event.target.value)} className={`${inputClass} min-h-20 resize-y`} placeholder={t('magazines.pageQuotePlaceholder')} />
      </Field>
      <Field label={t('magazines.pageFooter')}>
        <input value={draft.footer} onChange={(event) => update('footer', event.target.value)} className={inputClass} placeholder={t('magazines.pageFooterPlaceholder')} />
      </Field>
    </div>
  )
}
