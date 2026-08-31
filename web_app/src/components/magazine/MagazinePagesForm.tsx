import type { RefObject } from 'react'
import type { Magazine, MagazinePage } from '../../types'
import type { TFn } from '../../lib/i18n'
import { Icon } from '../../screens/admin/crm/ui'
import { PageEditor } from './PageEditor'
import type { MagazinePageDraft, PageEditorHandle, Result } from './magazineEditorTypes'

export function MagazinePagesForm({
  magazine,
  pages,
  pageIndex,
  safePageIndex,
  addingPage,
  navigating,
  savingPage,
  pageEditorRef,
  onAdd,
  onPage,
  onSave,
  onDelete,
  t,
}: {
  magazine: Magazine | null
  pages: MagazinePage[]
  pageIndex: number
  safePageIndex: number
  addingPage: boolean
  navigating: boolean
  savingPage: string | null
  pageEditorRef: RefObject<PageEditorHandle | null>
  onAdd: () => void
  onPage: (index: number) => void
  onSave: (page: MagazinePage, draft: MagazinePageDraft) => Promise<Result<MagazinePage>>
  onDelete: (page: MagazinePage) => void
  t: TFn
}) {
  const currentPage = pages[safePageIndex]
  return <section className="pt-1">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-lg font-bold text-[var(--dash-text)]">{t('magazines.pagesTitle')}</h3><p className="mt-1 text-sm text-[var(--dash-muted)]">{t('magazines.pagesDescription')}</p></div>{magazine && <button type="button" onClick={onAdd} disabled={addingPage} className="flex h-9 items-center gap-1.5 rounded-lg bg-[var(--dash-soft)] px-3 text-xs font-bold text-[var(--dash-text)] disabled:opacity-50"><Icon name="plus" size={14} /> {addingPage ? t('common.saving') : t('magazines.addPage')}</button>}</div>
    {!magazine ? <p className="mt-4 rounded-xl bg-[var(--dash-soft)] p-4 text-sm text-[var(--dash-muted)]">{t('magazines.saveBeforePages')}</p> : pages.length === 0 ? <p className="mt-4 rounded-xl bg-[var(--dash-soft)] p-4 text-sm text-[var(--dash-muted)]">{t('magazines.noPages')}</p> : <>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-3"><button type="button" disabled={pageIndex === 0 || navigating} onClick={() => onPage(Math.max(0, safePageIndex - 1))} className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:opacity-30"><Icon name="chevron-left" size={15} /> {t('magazines.previousPage')}</button><div className="min-w-0 flex-1"><label className="sr-only" htmlFor="magazine-page-selector">{t('magazines.choosePage')}</label><select id="magazine-page-selector" value={safePageIndex} onChange={(event) => onPage(Number(event.target.value))} disabled={navigating} className="h-9 w-full min-w-0 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-text)] outline-none focus:border-violet-400 disabled:opacity-50">{pages.map((page, index) => <option key={page.id} value={index}>{t('magazines.pageNumber', { number: index + 1 })} · {page.title || t('magazines.untitledPage')}</option>)}</select></div><button type="button" disabled={pageIndex === pages.length - 1 || navigating} onClick={() => onPage(Math.min(pages.length - 1, safePageIndex + 1))} className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:opacity-30">{t('magazines.nextPage')} <Icon name="chevron-right" size={15} /></button></div>
      {currentPage && <PageEditor ref={pageEditorRef} key={currentPage.id} page={currentPage} saving={savingPage === currentPage.id} onSave={(draft) => onSave(currentPage, draft)} onDelete={() => onDelete(currentPage)} t={t} />}
    </>}
  </section>
}
