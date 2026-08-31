import type { TFn } from '../../lib/i18n'
import { MAGAZINE_TEMPLATES } from './templateCatalog'
import { Check, Field, ImageField, inputClass } from './MagazineEditorFields'
import type { MagazineMetadataDraft } from './magazineEditorTypes'

export function MagazineMetadataForm({
  metadata,
  isCheeseFactoryJournal,
  update,
  t,
}: {
  metadata: MagazineMetadataDraft
  isCheeseFactoryJournal: boolean
  update: <K extends keyof MagazineMetadataDraft>(
    key: K,
    value: MagazineMetadataDraft[K]
  ) => void
  t: TFn
}) {
  const templates = isCheeseFactoryJournal
    ? MAGAZINE_TEMPLATES.filter((template) => template.id === 'pencil-journal')
    : MAGAZINE_TEMPLATES
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex flex-col gap-4">
        <Field label={t('magazines.name')}>
          <input autoFocus value={metadata.name} onChange={(event) => update('name', event.target.value)} className={inputClass} placeholder="The Cheese Factory Journal" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('magazines.issue')}>
            <input value={metadata.issue} onChange={(event) => update('issue', event.target.value)} className={inputClass} placeholder="Issue 01 · Autumn" />
          </Field>
          <Field label={t('magazines.coverImage')}>
            <ImageField value={metadata.coverImageUrl} onChange={(value) => update('coverImageUrl', value)} t={t} />
          </Field>
        </div>
        <Field label={t('magazines.description')}>
          <textarea value={metadata.description} onChange={(event) => update('description', event.target.value)} className={`${inputClass} min-h-24 resize-y`} placeholder={t('magazines.descriptionPlaceholder')} />
        </Field>
        <div className="flex flex-wrap gap-4">
          <Check checked={metadata.published} onChange={(value) => update('published', value)}>{t('magazines.publishedLabel')}</Check>
          <Check checked={metadata.showOnIndex} onChange={(value) => update('showOnIndex', value)}>{t('magazines.indexLabel')}</Check>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold text-[var(--dash-text2)]">{t('magazines.template')}</p>
        <div className="flex flex-col gap-2">
          {templates.map((template) => (
            <label key={template.id} className={`cursor-pointer rounded-xl border p-3 transition ${metadata.design === template.id ? 'border-violet-400 bg-violet-500/10' : 'border-[var(--dash-border)] hover:border-violet-400/50'}`}>
              <input type="radio" name="magazine-template" value={template.id} checked={metadata.design === template.id} onChange={() => update('design', template.id)} className="sr-only" />
              <span className="block text-sm font-bold text-[var(--dash-text)]">{t(template.nameKey)}</span>
              <span className="mt-1 block text-xs leading-5 text-[var(--dash-muted)]">{t(template.descriptionKey)}</span>
            </label>
          ))}
        </div>
        {isCheeseFactoryJournal && <p className="mt-2 text-xs leading-5 text-[var(--dash-muted)]">{t('magazines.templateFixed')}</p>}
      </div>
    </section>
  )
}
