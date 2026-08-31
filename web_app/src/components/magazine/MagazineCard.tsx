import type { TFn } from '../../lib/i18n'
import type { Magazine } from '../../types'
import { Icon } from '../../screens/admin/crm/ui'
import { MAGAZINE_TEMPLATES } from './templateCatalog'

export function MagazineCard({
  magazine,
  subdomain,
  canEdit,
  onEdit,
  onTogglePublished,
  onToggleIndex,
  onDelete,
  t,
}: {
  magazine: Magazine
  subdomain?: string
  canEdit: boolean
  onEdit: () => void
  onTogglePublished: () => void
  onToggleIndex: () => void
  onDelete: () => void
  t: TFn
}) {
  const publicUrl = `/m/${subdomain || ''}/${magazine.slug || magazine.id}`
  const template = MAGAZINE_TEMPLATES.find((entry) => entry.id === magazine.design)
  const designLabel = template ? t(template.nameKey) : magazine.design
  return (
    <article className="flex min-h-[245px] flex-col overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[0_10px_30px_-24px_rgba(15,23,42,0.8)]">
      <div className="relative flex h-28 items-end overflow-hidden bg-[#3A2A1D] p-4 text-[#F3EDE2]">
        {magazine.coverImageUrl && <img src={magazine.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#241B15] via-[#3A2A1D]/40 to-transparent" />
        <div className="relative flex min-w-0 items-center gap-2">
          <Icon name="book-open" size={18} className="shrink-0 text-[#D6B58B]" />
          <h2 className="truncate text-lg font-semibold" style={{ fontFamily: 'Georgia, serif' }}>{magazine.name}</h2>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--dash-muted)]">
          {magazine.issue && <span>{magazine.issue}</span>}
          <span>·</span>
          <span>{magazine.pages?.length ?? 0} {t('magazines.pages')}</span>
        </div>
        <p className="line-clamp-2 min-h-10 text-sm text-[var(--dash-text2)]">{magazine.description || t('magazines.noDescription')}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${magazine.published ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[var(--dash-soft)] text-[var(--dash-muted)]'}`}>
            {magazine.published ? t('magazines.published') : t('magazines.draft')}
          </span>
          <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-[11px] font-bold text-violet-300">{designLabel}</span>
          {magazine.showOnIndex && <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-[11px] font-bold text-violet-300">{t('magazines.onIndex')}</span>}
        </div>
        <div className="flex items-center gap-2 border-t border-[var(--dash-border)] pt-3">
          {magazine.published ? (
            <a href={publicUrl} target="_blank" rel="noreferrer" className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--dash-soft)] text-xs font-bold text-[var(--dash-link)] hover:opacity-80">
              <Icon name="external-link" size={14} /> {t('magazines.open')}
            </a>
          ) : (
            <span className="flex h-9 flex-1 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-xs font-semibold text-[var(--dash-muted)]">{t('magazines.publishToOpen')}</span>
          )}
          {canEdit && <>
            <button type="button" onClick={onTogglePublished} className="flex h-9 items-center justify-center rounded-lg bg-[var(--dash-soft)] px-2.5 text-xs font-bold text-[var(--dash-text2)] hover:text-[var(--dash-text)]">{magazine.published ? t('magazines.unpublish') : t('magazines.publish')}</button>
            <button type="button" onClick={onEdit} aria-label={t('magazines.edit')} title={t('magazines.edit')} className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:text-[var(--dash-text)]"><Icon name="pencil" size={15} /></button>
            <button type="button" onClick={onToggleIndex} aria-label={t('magazines.toggleIndex')} title={t('magazines.toggleIndex')} className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--dash-soft)] ${magazine.showOnIndex ? 'text-violet-300' : 'text-[var(--dash-text2)]'} hover:text-[var(--dash-text)]`}><Icon name="eye" size={15} /></button>
            <button type="button" onClick={onDelete} aria-label={t('magazines.delete')} title={t('magazines.delete')} className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:text-red-300"><Icon name="circle-x" size={15} /></button>
          </>}
        </div>
      </div>
    </article>
  )
}
