import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { MagazinePage } from '../../types'
import type { TFn } from '../../lib/i18n'
import { Icon } from '../../screens/admin/crm/ui'
import { gradient } from '../../screens/admin/crm/theme'
import { PageContentFields } from './PageContentFields'
import { PageImagePanel } from './PageImagePanel'
import { SaveStatus } from './MagazineEditorFields'
import { isPencilAsset, pageDraftFrom } from './magazineEditorUtils'
import type { MagazinePageDraft, PageEditorHandle, Result, SaveStatus as SaveState } from './magazineEditorTypes'

export const PageEditor = forwardRef<PageEditorHandle, {
  page: MagazinePage
  saving: boolean
  onSave: (draft: MagazinePageDraft) => Promise<Result<MagazinePage>>
  onDelete: () => void
  t: TFn
}>(function PageEditor({ page, saving, onSave, onDelete, t }, ref) {
  const [draft, setDraft] = useState(() => pageDraftFrom(page))
  const [status, setStatus] = useState<SaveState>('saved')
  const draftRef = useRef(draft)
  const onSaveRef = useRef(onSave)
  const dirtyRef = useRef(false)
  const hydratedRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const promiseRef = useRef<Promise<boolean> | null>(null)

  const changeDraft = (updater: (current: MagazinePageDraft) => MagazinePageDraft) => {
    dirtyRef.current = true
    setStatus('dirty')
    setDraft(updater)
  }
  const update = <K extends keyof MagazinePageDraft>(key: K, value: MagazinePageDraft[K]) => changeDraft((current) => ({ ...current, [key]: value }))
  const updatePrimary = (value: string) => changeDraft((current) => {
    const images = current.images.length ? [...current.images] : current.imageUrl.trim() ? [current.imageUrl] : []
    if (value.trim()) images[0] = value
    else images.shift()
    return { ...current, imageUrl: value, images, imagePositions: images.map((_, index) => current.imagePositions[index] || 'center') }
  })
  const updateAdditional = (value: string) => changeDraft((current) => {
    const primary = current.images[0] || current.imageUrl.trim()
    const pencilAssets = current.images.slice(1).filter(isPencilAsset)
    const additional = value.split('\n').map((source) => source.trim()).filter(Boolean)
    const images = [...new Set([primary, ...pencilAssets, ...additional].filter(Boolean))]
    return { ...current, imageUrl: images[0] || '', images, imagePositions: images.map((_, index) => current.imagePositions[index] || 'center') }
  })
  const moveImage = (index: number, direction: -1 | 1) => changeDraft((current) => {
    const target = index + direction
    if (target < 0 || target >= current.images.length) return current
    const images = [...current.images]
    const imagePositions = [...current.imagePositions]
    ;[images[index], images[target]] = [images[target], images[index]]
    ;[imagePositions[index], imagePositions[target]] = [imagePositions[target] || 'center', imagePositions[index] || 'center']
    return { ...current, imageUrl: images[0] || '', images, imagePositions }
  })
  const removeImage = (index: number) => changeDraft((current) => {
    const images = current.images.filter((_, imageIndex) => imageIndex !== index)
    return { ...current, imageUrl: images[0] || '', images, imagePositions: current.imagePositions.filter((_, imageIndex) => imageIndex !== index) }
  })
  const updatePosition = (index: number, position: string) => changeDraft((current) => {
    const imagePositions = [...current.imagePositions]
    imagePositions[index] = position
    return { ...current, imagePositions }
  })
  const saveNow = useCallback(async () => {
    if (!dirtyRef.current) return true
    if (promiseRef.current) return promiseRef.current
    const snapshot = draftRef.current
    setStatus('saving')
    const promise = onSaveRef.current(snapshot).then((response) => {
      if (response.error || !response.data) { dirtyRef.current = true; setStatus('error'); return false }
      if (draftRef.current === snapshot) { dirtyRef.current = false; setStatus('saved') } else setStatus('dirty')
      return true
    }).catch(() => { dirtyRef.current = true; setStatus('error'); return false })
    promiseRef.current = promise
    void promise.then(() => { if (promiseRef.current === promise) promiseRef.current = null })
    return promise
  }, [])
  useImperativeHandle(ref, () => ({ saveNow }), [saveNow])

  useEffect(() => { draftRef.current = draft; onSaveRef.current = onSave }, [draft, onSave])
  useEffect(() => {
    if (!hydratedRef.current) { hydratedRef.current = true; return }
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => void saveNow(), 850)
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current) }
  }, [draft, saveNow])

  return <article className="mt-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-4 sm:p-5">
    <div className="mb-4 flex items-center justify-between gap-3"><div><span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--dash-muted)]">{t('magazines.pageNumber', { number: page.position + 1 })}</span><h4 className="mt-1 font-bold text-[var(--dash-text)]">{draft.title || t('magazines.untitledPage')}</h4></div><button type="button" onClick={onDelete} disabled={saving} className="text-[var(--dash-muted)] hover:text-red-300 disabled:opacity-50" aria-label={t('magazines.deletePage')}><Icon name="circle-x" size={18} /></button></div>
    <div className="grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)]"><PageImagePanel draft={draft} updatePrimary={updatePrimary} updateAdditional={updateAdditional} moveImage={moveImage} removeImage={removeImage} updatePosition={updatePosition} t={t} /><PageContentFields draft={draft} update={update} t={t} /></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--dash-border)] pt-4"><div><p className="text-xs text-[var(--dash-muted)]">{t('magazines.pageWizardHint')}</p><SaveStatus status={status} t={t} /></div><button type="button" onClick={() => void saveNow()} disabled={saving || status === 'saving' || (status !== 'dirty' && status !== 'error')} className={`h-9 rounded-lg px-3 text-xs font-bold text-white disabled:opacity-50 ${gradient}`}>{status === 'saving' || saving ? t('magazines.savingChanges') : t('magazines.saveNow')}</button></div>
  </article>
})
