import { useCallback, useEffect, useRef, useState } from 'react'
import type { Magazine, MagazinePage } from '../../types'
import { MagazineEditorChrome } from './MagazineEditorChrome'
import { MagazineMetadataForm } from './MagazineMetadataForm'
import { MagazinePagesForm } from './MagazinePagesForm'
import { metadataFrom, pageDraftFrom } from './magazineEditorUtils'
import type { EditorProps, MagazineMetadataDraft, MagazinePageDraft, PageEditorHandle, Result, SaveStatus } from './magazineEditorTypes'

export type { MagazineMetadataDraft, MagazinePageDraft } from './magazineEditorTypes'

export function MagazineEditor({ magazine, onClose, onSaveMagazine, onCreatePage, onSavePage, onDeletePage, t }: EditorProps) {
  const [metadata, setMetadata] = useState(() => metadataFrom(magazine))
  const [pages, setPages] = useState<MagazinePage[]>(() => [...(magazine?.pages ?? [])].sort((a, b) => a.position - b.position))
  const [screen, setScreen] = useState<'metadata' | 'pages'>('metadata')
  const [pageIndex, setPageIndex] = useState(0)
  const [savingMetadata, setSavingMetadata] = useState(false)
  const [savingPage, setSavingPage] = useState<string | null>(null)
  const [addingPage, setAddingPage] = useState(false)
  const [metadataStatus, setMetadataStatus] = useState<SaveStatus>(magazine ? 'saved' : 'idle')
  const [navigating, setNavigating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const metadataRef = useRef(metadata)
  const savePromiseRef = useRef<Promise<Result<Magazine>> | null>(null)
  const hydratedRef = useRef(false)
  const pageEditorRef = useRef<PageEditorHandle | null>(null)
  const tRef = useRef(t)
  const saveMagazineRef = useRef(onSaveMagazine)
  const updateMetadata = <K extends keyof MagazineMetadataDraft>(key: K, value: MagazineMetadataDraft[K]) => setMetadata((current) => ({ ...current, [key]: value }))

  const saveMetadata = useCallback(async (draft = metadataRef.current): Promise<Result<Magazine>> => {
    if (!draft.name.trim()) { const response = { error: tRef.current('magazines.nameRequired') }; setMetadataStatus('error'); return response }
    if (savePromiseRef.current) return savePromiseRef.current
    setSavingMetadata(true); setMetadataStatus('saving'); setError(null)
    const promise = saveMagazineRef.current({ ...draft, name: draft.name.trim() }).then((response) => {
      setSavingMetadata(false); const failed = Boolean(response.error || !response.data); setMetadataStatus(failed ? 'error' : 'saved'); if (response.error) setError(response.error); return response
    }).catch((reason: unknown) => { setSavingMetadata(false); setMetadataStatus('error'); const message = reason instanceof Error ? reason.message : tRef.current('common.error'); setError(message); return { error: message } })
    savePromiseRef.current = promise
    void promise.then(() => { if (savePromiseRef.current === promise) savePromiseRef.current = null })
    return promise
  }, [])
  useEffect(() => { metadataRef.current = metadata; tRef.current = t; saveMagazineRef.current = onSaveMagazine }, [metadata, onSaveMagazine, t])
  useEffect(() => {
    if (!hydratedRef.current) { hydratedRef.current = true; return }
    if (!magazine || !metadata.name.trim()) return
    setMetadataStatus('dirty'); const timeout = window.setTimeout(() => void saveMetadata(), 850)
    return () => window.clearTimeout(timeout)
  }, [magazine, metadata, saveMetadata])

  const continueToPages = async () => { const response = await saveMetadata(); if (response.data) { setPages([...response.data.pages].sort((a, b) => a.position - b.position)); setScreen('pages') } }
  const addPage = async () => {
    if (!magazine) return
    setAddingPage(true); setError(null)
    const position = pages.length ? Math.max(...pages.map((page) => page.position)) + 1 : 0
    const blank = pageDraftFrom({ id: '', magazineId: magazine.id, position, pageType: 'editorial', title: null, imageUrl: null, content: null })
    const response = await onCreatePage(blank); setAddingPage(false)
    if (response.data) { const nextPages = [...pages, response.data].sort((a, b) => a.position - b.position); setPages(nextPages); setPageIndex(nextPages.findIndex((page) => page.id === response.data?.id)) } else setError(response.error ?? null)
  }
  const savePage = async (page: MagazinePage, draft: MagazinePageDraft) => {
    setSavingPage(page.id); setError(null); const response = await onSavePage(page.id, draft); setSavingPage(null)
    if (response.data) setPages((current) => current.map((item) => item.id === page.id ? response.data! : item).sort((a, b) => a.position - b.position)); else setError(response.error ?? null)
    return response
  }
  const deletePage = async (page: MagazinePage) => {
    if (!window.confirm(t('magazines.deletePageConfirm', { title: page.title || t('magazines.untitledPage') }))) return
    setSavingPage(page.id); setError(null); const response = await onDeletePage(page.id); setSavingPage(null)
    if (response.data) { setPages((current) => current.filter((item) => item.id !== page.id)); setPageIndex((current) => Math.max(0, current - (current >= pages.findIndex((item) => item.id === page.id) ? 1 : 0))) } else setError(response.error ?? null)
  }
  const safePageIndex = Math.min(pageIndex, Math.max(0, pages.length - 1))
  const flushPage = async () => { if (!pages[safePageIndex] || !pageEditorRef.current) return true; setNavigating(true); const saved = await pageEditorRef.current.saveNow(); setNavigating(false); return saved }
  const goToPage = async (index: number) => { if (index === safePageIndex || navigating) return; if (await flushPage()) setPageIndex(index) }
  const goToMetadata = async () => { if (navigating) return; if (screen === 'pages' && !(await flushPage())) return; setScreen('metadata') }
  const closeEditor = async () => { if (navigating) return; if (screen === 'pages' && !(await flushPage())) return; if (screen === 'metadata' && magazine && !(await saveMetadata()).data) return; onClose() }

  return <MagazineEditorChrome screen={screen} canShowPages={Boolean(magazine)} canContinue={Boolean(metadata.name.trim())} navigating={navigating} metadataStatus={metadataStatus} savingMetadata={savingMetadata} error={error} onClose={() => void closeEditor()} onMetadata={() => void goToMetadata()} onPages={() => setScreen('pages')} onContinue={() => void continueToPages()} t={t}>
    {screen === 'metadata' ? <MagazineMetadataForm metadata={metadata} isCheeseFactoryJournal={magazine?.slug === 'the_cheese_factory_journal'} update={updateMetadata} t={t} /> : <MagazinePagesForm magazine={magazine} pages={pages} pageIndex={pageIndex} safePageIndex={safePageIndex} addingPage={addingPage} navigating={navigating} savingPage={savingPage} pageEditorRef={pageEditorRef} onAdd={() => void addPage()} onPage={(index) => void goToPage(index)} onSave={savePage} onDelete={(page) => void deletePage(page)} t={t} />}
  </MagazineEditorChrome>
}
