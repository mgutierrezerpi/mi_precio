import type { ReactNode } from 'react'
import type { TFn } from '../../lib/i18n'
import { Icon } from '../../screens/admin/crm/ui'
import { gradient } from '../../screens/admin/crm/theme'
import { SaveStatus } from './MagazineEditorFields'
import type { SaveStatus as SaveState } from './magazineEditorTypes'

export function MagazineEditorChrome({
  screen,
  canShowPages,
  navigating,
  metadataStatus,
  savingMetadata,
  canContinue,
  error,
  onClose,
  onMetadata,
  onPages,
  onContinue,
  children,
  t,
}: {
  screen: 'metadata' | 'pages'
  canShowPages: boolean
  navigating: boolean
  metadataStatus: SaveState
  savingMetadata: boolean
  canContinue: boolean
  error: string | null
  onClose: () => void
  onMetadata: () => void
  onPages: () => void
  onContinue: () => void
  children: ReactNode
  t: TFn
}) {
  const title = screen === 'metadata' ? t('magazines.editTitle') : t('magazines.pagesTitle')
  const description = screen === 'metadata' ? t('magazines.editorDescription') : t('magazines.pagesDescription')
  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/60 p-3 sm:flex sm:items-center sm:justify-center sm:p-6" onMouseDown={onClose}>
    <div onMouseDown={(event) => event.stopPropagation()} className="my-0 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-y-auto rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 shadow-2xl sm:my-auto sm:max-h-[calc(100dvh-3rem)] sm:p-6">
      <div className="mb-5 flex shrink-0 items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--dash-muted)]">{t('magazines.eyebrow')}</p><h2 className="mt-1 text-xl font-bold text-[var(--dash-text)]">{title}</h2><p className="mt-1 text-sm text-[var(--dash-muted)]">{description}</p>{screen === 'metadata' && <SaveStatus status={metadataStatus} t={t} />}</div><button type="button" onClick={onClose} disabled={navigating} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--dash-muted)] transition hover:bg-[var(--dash-soft)] hover:text-[var(--dash-text)] disabled:opacity-40"><Icon name="circle-x" size={20} /></button></div>
      <nav className="mb-6 flex shrink-0 items-center gap-1.5 border-b border-[var(--dash-border)] pb-3" aria-label={t('magazines.editorSteps')}><button type="button" onClick={onMetadata} disabled={navigating} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${screen === 'metadata' ? 'bg-violet-500/15 text-violet-300' : 'text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] disabled:opacity-40'}`}><span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-[10px]">1</span>{t('magazines.editTitle')}</button><span className="px-1 text-xs text-[var(--dash-muted)]/50" aria-hidden="true">/</span><button type="button" disabled={!canShowPages || navigating} onClick={onPages} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${screen === 'pages' ? 'bg-violet-500/15 text-violet-300' : 'text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] disabled:cursor-not-allowed disabled:opacity-40'}`}><span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-[10px]">2</span>{t('magazines.pagesTitle')}</button></nav>
      {children}
      {error && <p className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm font-semibold text-red-300">{error}</p>}
      <div className="mt-6 flex shrink-0 justify-end gap-2 border-t border-[var(--dash-border)] pt-4">{screen === 'metadata' ? <><button type="button" onClick={onClose} disabled={navigating} className="h-10 rounded-lg px-4 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:opacity-40">{t('common.cancel')}</button><button type="button" onClick={onContinue} disabled={savingMetadata || !canContinue} className={`h-10 rounded-lg px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${gradient}`}>{savingMetadata ? t('common.saving') : t('magazines.continueToPages')}</button></> : <><button type="button" onClick={onMetadata} disabled={navigating} className="inline-flex h-10 items-center gap-1 rounded-lg px-4 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:opacity-40"><Icon name="chevron-left" size={15} /> {t('magazines.backToMagazine')}</button><button type="button" onClick={onClose} disabled={navigating} className={`h-10 rounded-lg px-5 text-sm font-bold text-white disabled:opacity-50 ${gradient}`}>{t('common.done')}</button></>}</div>
    </div>
  </div>
}
