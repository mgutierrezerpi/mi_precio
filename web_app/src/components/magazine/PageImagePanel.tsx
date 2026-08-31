import type { TFn } from '../../lib/i18n'
import { Field, ImageField, IMAGE_POSITIONS, inputClass } from './MagazineEditorFields'
import { isPencilAsset } from './magazineEditorUtils'
import type { MagazinePageDraft } from './magazineEditorTypes'

export function PageImagePanel({
  draft,
  updatePrimary,
  updateAdditional,
  moveImage,
  removeImage,
  updatePosition,
  t,
}: {
  draft: MagazinePageDraft
  updatePrimary: (value: string) => void
  updateAdditional: (value: string) => void
  moveImage: (index: number, direction: -1 | 1) => void
  removeImage: (index: number) => void
  updatePosition: (index: number, value: string) => void
  t: TFn
}) {
  const previewImages = draft.images.length ? draft.images : draft.imageUrl.trim() ? [draft.imageUrl.trim()] : []
  const positions = previewImages.map((_, index) => draft.imagePositions[index] || 'center')
  return (
    <div>
      <ImageField value={draft.imageUrl} onChange={updatePrimary} t={t} />
      <div className="mt-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-2.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--dash-text2)]">{t('magazines.imagePreview')}</p>
          <span className="rounded-full bg-[var(--dash-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--dash-muted)]">{previewImages.length}</span>
        </div>
        {previewImages.length ? (
          <div className="grid grid-cols-3 gap-2">
            {previewImages.map((source, index) => (
              <div key={`${source}-${index}`} className="min-w-0">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)]">
                  <img src={source} alt={t('magazines.imageNumber', { number: index + 1 })} className="h-full w-full object-cover" style={{ objectPosition: positions[index] }} />
                  <span className="absolute bottom-1 left-1 max-w-[calc(100%-0.5rem)] truncate rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">{index === 0 ? t('magazines.primaryImage') : String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="rounded px-1 text-sm leading-none text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)] disabled:opacity-25" aria-label={t('magazines.moveImageUp')}>↑</button>
                  <button type="button" onClick={() => moveImage(index, 1)} disabled={index === previewImages.length - 1} className="rounded px-1 text-sm leading-none text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)] disabled:opacity-25" aria-label={t('magazines.moveImageDown')}>↓</button>
                  <button type="button" onClick={() => removeImage(index)} className="rounded px-1 text-sm leading-none text-[var(--dash-muted)] hover:bg-red-500/10 hover:text-red-300" aria-label={t('magazines.removeImage')}>×</button>
                </div>
                <label className="mt-1 block"><span className="sr-only">{t('magazines.imagePosition')}</span><select value={positions[index]} onChange={(event) => updatePosition(index, event.target.value)} className="w-full rounded border border-[var(--dash-border)] bg-[var(--dash-bg)] px-1 py-1 text-[10px] font-semibold text-[var(--dash-text2)] outline-none focus:border-violet-400">{IMAGE_POSITIONS.map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label>
              </div>
            ))}
          </div>
        ) : <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-[var(--dash-border)] px-2 text-center text-xs text-[var(--dash-muted)]">{t('magazines.noImages')}</div>}
      </div>
      <Field label={t('magazines.additionalImages')}>
        <textarea value={draft.images.slice(1).filter((source) => !isPencilAsset(source)).join('\n')} onChange={(event) => updateAdditional(event.target.value)} className={`${inputClass} mt-1 min-h-24 resize-y`} placeholder="https://…" />
      </Field>
      <p className="mt-1 text-[11px] leading-4 text-[var(--dash-muted)]">{t('magazines.additionalImagesHint')} {t('magazines.imageControlsHint')}</p>
    </div>
  )
}
