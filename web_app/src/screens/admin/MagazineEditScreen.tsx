import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectCanEdit, selectTenant } from '../../store/slices/authSlice'
import api from '../../services/api'
import type { Magazine, MagazinePage } from '../../types'
import { useT } from '../../lib/i18n'
import { fileToDataUrl } from '../../lib/image'
import { DEFAULT_MAGAZINE_PRODUCTS, type MagazineProductContent } from '../../components/magazine/templateCatalog'
import {
  MagazineEditorPreview,
  type MagazineEditField,
  type MagazineEditSelection,
} from '../../screens/menu/pencilJournal'
import { WildStemEditorPreview } from '../../screens/menu/wildStemJournal'
import { AquaObjectsEditorPreview } from '../../screens/menu/aquaObjectsJournal'
import type { MagazinePageDraft } from '../../components/magazine/MagazineEditor'
import { Icon } from './crm/ui'

type SaveState = 'saved' | 'dirty' | 'saving' | 'error'
type MagazineTextField = Exclude<MagazineEditField, 'image' | 'productName' | 'productDescription' | 'productPrice'>
const MAGAZINE_MONO = '"IBM Plex Mono", "Courier New", monospace'

export function MagazineEditScreen() {
  const t = useT()
  const navigate = useNavigate()
  const { magazineId } = useParams<{ magazineId: string }>()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const [magazine, setMagazine] = useState<Magazine | null>(null)
  const [pages, setPages] = useState<MagazinePage[]>([])
  const [drafts, setDrafts] = useState<Record<string, MagazinePageDraft>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selection, setSelection] = useState<MagazineEditSelection | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [undoCount, setUndoCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const tenantId = tenant?.id
  const tRef = useRef(t)
  const draftsRef = useRef(drafts)
  const timersRef = useRef(new Map<string, number>())
  const dirtyPagesRef = useRef(new Set<string>())
  const undoStacksRef = useRef(new Map<string, MagazinePageDraft[]>())
  const historyGroupRef = useRef<{ pageId: string; changedAt: number } | null>(null)

  useEffect(() => {
    tRef.current = t
  }, [t])

  const load = useCallback(async () => {
    if (!tenantId || !magazineId) return
    setLoading(true)
    const response = await api.getMagazines(tenantId)
    const found = response.data?.find((item) => item.id === magazineId)
    if (!found) {
      setError(response.error ?? tRef.current('magazines.noResults'))
      setLoading(false)
      return
    }
    const orderedPages = [...found.pages].sort((a, b) => a.position - b.position)
    const nextDrafts = Object.fromEntries(orderedPages.map((page) => [page.id, pageDraftFrom(page)]))
    setMagazine(found)
    setPages(orderedPages)
    setDrafts(nextDrafts)
    draftsRef.current = nextDrafts
    undoStacksRef.current.clear()
    historyGroupRef.current = null
    setUndoCount(0)
    setCurrentIndex(0)
    setError(null)
    setLoading(false)
  }, [magazineId, tenantId])

  // Loading server state is intentionally triggered by the tenant/route change.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const currentPage = pages[Math.min(currentIndex, Math.max(0, pages.length - 1))]
  const currentDraft = currentPage ? drafts[currentPage.id] : undefined
  const renderedPages = useMemo(() => pages.map((page) => {
    const draft = drafts[page.id]
    return draft ? pageFromDraft(page, draft) : page
  }), [drafts, pages])

  const savePage = useCallback(async (pageId: string, draft: MagazinePageDraft) => {
    setSaveState('saving')
    const response = await api.updateMagazinePage(pageId, pagePayload(draft))
    if (response.data) {
      setPages((current) => current.map((page) => page.id === pageId ? response.data! : page))
      const savedDraft = pageDraftFrom(response.data)
      draftsRef.current = { ...draftsRef.current, [pageId]: savedDraft }
      setDrafts(draftsRef.current)
      dirtyPagesRef.current.delete(pageId)
      setSaveState('saved')
      setError(null)
    } else {
      setSaveState('error')
      setError(response.error ?? t('magazines.autosaveError'))
    }
  }, [t])

  const scheduleSave = useCallback((pageId: string, draft: MagazinePageDraft) => {
    const existing = timersRef.current.get(pageId)
    if (existing) window.clearTimeout(existing)
    timersRef.current.set(pageId, window.setTimeout(() => {
      timersRef.current.delete(pageId)
      void savePage(pageId, draft)
    }, 700))
  }, [savePage])

  const updateDraft = (updater: (draft: MagazinePageDraft) => MagazinePageDraft) => {
    if (!currentPage || !currentDraft) return
    const pageId = currentPage.id
    const now = Date.now()
    const historyGroup = historyGroupRef.current
    if (!historyGroup || historyGroup.pageId !== pageId || now - historyGroup.changedAt > 700) {
      const stack = undoStacksRef.current.get(pageId) ?? []
      stack.push(currentDraft)
      if (stack.length > 50) stack.shift()
      undoStacksRef.current.set(pageId, stack)
      setUndoCount(stack.length)
    }
    historyGroupRef.current = { pageId, changedAt: now }
    const next = updater(currentDraft)
    draftsRef.current = { ...draftsRef.current, [pageId]: next }
    setDrafts(draftsRef.current)
    dirtyPagesRef.current.add(pageId)
    setSaveState('dirty')
    scheduleSave(pageId, next)
  }

  const undo = useCallback(() => {
    if (!currentPage || !currentDraft) return
    const stack = undoStacksRef.current.get(currentPage.id)
    const previous = stack?.pop()
    if (!previous) return
    historyGroupRef.current = null
    setUndoCount(stack?.length ?? 0)
    draftsRef.current = { ...draftsRef.current, [currentPage.id]: previous }
    setDrafts(draftsRef.current)
    dirtyPagesRef.current.add(currentPage.id)
    setSaveState('dirty')
    scheduleSave(currentPage.id, previous)
  }, [currentDraft, currentPage, scheduleSave])

  useEffect(() => {
    const handleUndo = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.key.toLowerCase() !== 'z') return
      event.preventDefault()
      undo()
    }
    window.addEventListener('keydown', handleUndo)
    return () => window.removeEventListener('keydown', handleUndo)
  }, [undo])

  const leaveEditor = async () => {
    const pending = [...dirtyPagesRef.current]
    await Promise.all(pending.map((pageId) => {
      const timer = timersRef.current.get(pageId)
      if (timer) window.clearTimeout(timer)
      timersRef.current.delete(pageId)
      const draft = draftsRef.current[pageId]
      return draft ? savePage(pageId, draft) : Promise.resolve()
    }))
    navigate('/admin/magazines')
  }

  const selectElement = (nextSelection: MagazineEditSelection) => {
    setSelection(nextSelection)
  }

  const updateText = (field: MagazineTextField, value: string) => {
    updateDraft((draft) => ({ ...draft, [field]: value }))
  }

  const updateProductText = (field: 'productName' | 'productDescription' | 'productPrice', value: string) => {
    const index = selection?.productIndex ?? 0
    updateDraft((draft) => {
      const defaults = DEFAULT_MAGAZINE_PRODUCTS[draft.layout] ?? DEFAULT_MAGAZINE_PRODUCTS.pantry
      const productCount = Math.max(defaults.length, draft.products?.length ?? 0)
      const products = Array.from({ length: productCount }, (_, productIndex) => {
        const base = defaults[productIndex] ?? draft.products?.[productIndex] ?? { name: '', price: '', description: '' }
        return { ...base, ...(draft.products?.[productIndex] ?? {}) }
      })
      const product = products[index]
      if (!product) return draft
      const key = field === 'productName' ? 'name' : field === 'productDescription' ? 'description' : 'price'
      products[index] = { ...product, [key]: value }
      return { ...draft, products }
    })
  }

  const updateImage = (value: string) => {
    const index = selection?.imageIndex ?? 0
    updateDraft((draft) => {
      const images = draft.images.length ? [...draft.images] : draft.imageUrl ? [draft.imageUrl] : []
      while (images.length <= index) images.push('')
      images[index] = value
      const compact = images.filter(Boolean)
      return { ...draft, imageUrl: compact[0] ?? '', images: compact, imagePositions: compact.map((_, imageIndex) => draft.imagePositions[imageIndex] || 'center') }
    })
  }

  const updateImagePosition = (value: string) => {
    const index = selection?.imageIndex ?? 0
    updateDraft((draft) => {
      const imagePositions = [...draft.imagePositions]
      imagePositions[index] = value
      return { ...draft, imagePositions }
    })
  }

  if (!canEdit) return <div className="p-8 text-sm text-[var(--dash-muted)]">{t('common.error')}</div>
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#17120f] text-sm text-[#F3EDE2]">{t('magazines.loading')}</div>
  if (error && !magazine) return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#17120f] px-6 text-center text-[#F3EDE2]"><p>{error}</p><Link to="/admin/magazines" className="underline">{t('magazines.backToMagazine')}</Link></div>
  if (!magazine) return null

  return (
    <div className="flex min-h-screen flex-col bg-[#241B15] text-[#F3EDE2]">
      <header className="z-20 shrink-0 border-b border-[#F3EDE2]/10 bg-[#241B15] px-4 py-2.5 sm:px-6 sm:py-3">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => void leaveEditor()} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3A2A1D]/80 text-[#D6B58B] hover:bg-[#3A2A1D]" aria-label={t('magazines.backToMagazine')}><Icon name="chevron-left" size={16} /></button>
            <div className="min-w-0" style={{ fontFamily: MAGAZINE_MONO }}><p className="max-w-[190px] truncate text-[8px] uppercase tracking-[1.8px] text-[#D6B58B] sm:max-w-none">{magazine.name}</p><p className="mt-0.5 text-[8px] uppercase tracking-[1.3px] text-[#F3EDE2]/75">{t('magazines.editTitle')}</p></div>
          </div>
          <div className="flex min-w-0 max-w-[28vw] flex-1 items-center justify-start gap-1.5 overflow-x-auto py-1 [scrollbar-width:none] md:max-w-none md:justify-center md:overflow-visible" aria-label="Magazine pages">
            {pages.map((page, index) => <button key={page.id} type="button" aria-label={`Go to page ${index + 1}`} aria-current={index === currentIndex ? 'page' : undefined} onClick={() => { setCurrentIndex(index); setSelection(null); historyGroupRef.current = null; setUndoCount(undoStacksRef.current.get(page.id)?.length ?? 0) }} className={`h-1.5 rounded-full transition-all ${index === currentIndex ? 'w-6 bg-[#D6B58B]' : 'w-1.5 bg-[#F3EDE2]/30 hover:bg-[#F3EDE2]/60'}`} />)}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5" style={{ fontFamily: MAGAZINE_MONO }}>
            <span className="text-[9px] uppercase tracking-[1.3px] text-[#F3EDE2]/80">{String(currentIndex + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}</span>
            <button type="button" onClick={undo} disabled={undoCount === 0} className="flex h-8 items-center gap-1 rounded-full border border-[#F3EDE2]/10 px-2.5 text-[8px] uppercase tracking-[.8px] text-[#D6B58B] hover:bg-[#3A2A1D] disabled:cursor-not-allowed disabled:opacity-35" aria-label={`${t('magazines.undo')} (⌘Z)`}>↶<span className="hidden lg:inline">{t('magazines.undo')}</span><kbd className="hidden rounded border border-[#F3EDE2]/10 px-1 py-0.5 text-[8px] normal-case tracking-normal lg:inline">⌘Z</kbd></button>
            <span className={`hidden text-[8px] uppercase tracking-[.9px] sm:block ${saveState === 'error' ? 'text-red-300' : saveState === 'saving' ? 'text-amber-200' : saveState === 'dirty' ? 'text-violet-200' : 'text-emerald-200'}`}>{saveStateLabel(saveState, t)}</span>
            <button type="button" onClick={() => void leaveEditor()} className="h-8 rounded-full bg-[#D6B58B] px-3.5 text-[9px] font-bold uppercase tracking-[.9px] text-[#3A2A1D] hover:bg-[#E5BF8B]">{t('common.done')}</button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <section className="relative h-full min-h-[680px]">
          {pages.length ? (magazine.design === 'aqua-objects' ? <AquaObjectsEditorPreview
            magazineTitle={magazine.name}
            magazinePages={renderedPages}
            pageIndex={currentIndex}
            embedded
            onSelect={selectElement}
            onPageChange={(index) => { setCurrentIndex(index); setSelection(null); historyGroupRef.current = null; setUndoCount(undoStacksRef.current.get(pages[index]?.id ?? '')?.length ?? 0) }}
            inlineEditing={selection?.field === 'image' ? null : selection}
            inlineValue={selection && currentDraft ? inlineTextValue(currentDraft, selection) : ''}
            onInlineChange={(value) => {
              if (!selection || selection.field === 'image') return
              if (selection.field === 'productName' || selection.field === 'productDescription' || selection.field === 'productPrice') updateProductText(selection.field, value)
              else updateText(selection.field as MagazineTextField, value)
            }}
            onInlineCommit={() => setSelection(null)}
          /> : magazine.design === 'wild-stem' ? <WildStemEditorPreview
            magazineTitle={magazine.name}
            magazinePages={renderedPages}
            pageIndex={currentIndex}
            embedded
            onSelect={selectElement}
            onPageChange={(index) => { setCurrentIndex(index); setSelection(null); historyGroupRef.current = null; setUndoCount(undoStacksRef.current.get(pages[index]?.id ?? '')?.length ?? 0) }}
            inlineEditing={selection?.field === 'image' ? null : selection}
            inlineValue={selection && currentDraft ? inlineTextValue(currentDraft, selection) : ''}
            onInlineChange={(value) => {
              if (!selection || selection.field === 'image') return
              if (selection.field === 'productName' || selection.field === 'productDescription' || selection.field === 'productPrice') updateProductText(selection.field, value)
              else updateText(selection.field as MagazineTextField, value)
            }}
            onInlineCommit={() => setSelection(null)}
          /> : <MagazineEditorPreview
            magazineTitle={magazine.name}
            magazineCoverImage={magazine.coverImageUrl}
            magazinePages={renderedPages}
            pageIndex={currentIndex}
            embedded
            onSelect={selectElement}
            onPageChange={(index) => { setCurrentIndex(index); setSelection(null); historyGroupRef.current = null; setUndoCount(undoStacksRef.current.get(pages[index]?.id ?? '')?.length ?? 0) }}
            inlineEditing={selection?.field === 'image' ? null : selection}
            inlineValue={selection && currentDraft ? inlineTextValue(currentDraft, selection) : ''}
            onInlineChange={(value) => {
              if (!selection || selection.field === 'image') return
              if (selection.field === 'productName' || selection.field === 'productDescription' || selection.field === 'productPrice') updateProductText(selection.field, value)
              else updateText(selection.field as MagazineTextField, value)
            }}
            onInlineCommit={() => setSelection(null)}
          />) : <div className="flex h-full min-h-[640px] items-center justify-center rounded-2xl bg-[#241b15] text-sm text-[#D6B58B]">{t('magazines.noPages')}</div>}
          {currentDraft && selection?.field === 'image' && <ImageControls draft={currentDraft} selection={selection} onImageChange={updateImage} onImagePositionChange={updateImagePosition} onSelect={setSelection} t={t} />}
        </section>
      </div>
    </div>
  )
}

function ImageControls({ draft, selection, onImageChange, onImagePositionChange, onSelect, t }: { draft: MagazinePageDraft; selection: MagazineEditSelection; onImageChange: (value: string) => void; onImagePositionChange: (value: string) => void; onSelect: (selection: MagazineEditSelection | null) => void; t: ReturnType<typeof useT> }) {
  const images = draft.images.length ? draft.images : draft.imageUrl ? [draft.imageUrl] : []
  const imageIndex = Math.min(selection.imageIndex ?? 0, Math.max(0, images.length - 1))
  return <div className="absolute bottom-5 right-5 z-40 w-[min(330px,calc(100%-2.5rem))] rounded-2xl border border-white/10 bg-[#211a16]/95 p-3 shadow-2xl backdrop-blur sm:bottom-8 sm:right-8">
    <div className="mb-3 flex items-center justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D6B58B]">{t('magazines.imagePreview')}</p><button type="button" onClick={() => onSelect(null)} className="text-[#C8B9A9] hover:text-white" aria-label={t('common.close')}><Icon name="circle-x" size={15} /></button></div>
    <div className="flex flex-col gap-3">
      {images.length > 0 && <div className="grid grid-cols-3 gap-2">{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => onSelect({ field: 'image', imageIndex: index })} className={`aspect-square overflow-hidden rounded-lg border-2 ${index === imageIndex ? 'border-[#D6B58B]' : 'border-white/10'}`}><img src={image} alt={t('magazines.imageNumber', { number: index + 1 })} className="h-full w-full object-cover" /></button>)}</div>}
      <label className="flex flex-col gap-1.5 text-xs font-bold text-[#D8CABB]">{t('magazines.imagePreview')}<input value={visibleImageUrl(images[imageIndex] ?? '')} onChange={(event) => onImageChange(event.target.value)} className={editorInput} placeholder="https://…" /></label>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 px-3 py-2.5 text-xs font-bold text-[#D6B58B] hover:bg-white/5"><Icon name="upload" size={14} />{t('magazines.uploadImage')}<input type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void fileToDataUrl(file, 1600).then(onImageChange); event.target.value = '' }} /></label>
      <label className="flex flex-col gap-1.5 text-xs font-bold text-[#D8CABB]">{t('magazines.imagePosition')}<select value={draft.imagePositions[imageIndex] || 'center'} onChange={(event) => onImagePositionChange(event.target.value)} className={editorInput}>{IMAGE_POSITIONS.map((position) => <option key={position.value} value={position.value}>{t(position.label)}</option>)}</select></label>
    </div>
  </div>
}

const editorInput = 'w-full rounded-lg border border-white/10 bg-[#17120f] px-3 py-2.5 text-sm font-medium text-[#F3EDE2] outline-none placeholder:text-[#817466] focus:border-[#D6B58B]'

function visibleImageUrl(value: string) {
  return value.startsWith('/pencil/') ? '' : value
}

const IMAGE_POSITIONS = [
  { value: 'center', label: 'magazines.imagePositionCenter' }, { value: 'top', label: 'magazines.imagePositionTop' }, { value: 'bottom', label: 'magazines.imagePositionBottom' }, { value: 'left', label: 'magazines.imagePositionLeft' }, { value: 'right', label: 'magazines.imagePositionRight' },
]

function saveStateLabel(state: SaveState, t: ReturnType<typeof useT>) {
  if (state === 'saving') return t('magazines.autosaveSaving')
  if (state === 'dirty') return t('magazines.autosaveUnsaved')
  if (state === 'error') return t('magazines.autosaveError')
  return t('magazines.autosaveSaved')
}

function pageDraftFrom(page: MagazinePage): MagazinePageDraft {
  const content = (page.content ?? {}) as Record<string, unknown>
  const images = [...new Set([page.imageUrl ?? '', ...((content.images as string[] | undefined) ?? [])].map((image) => image.trim()).filter(Boolean))]
  const body = String(content.body ?? content.copy ?? '')
  return { position: page.position, pageType: page.pageType || 'editorial', layout: String(content.layout ?? ''), title: page.title ?? String(content.headline ?? ''), imageUrl: images[0] ?? '', images, imagePositions: images.map((_, index) => String((content.imagePositions as string[] | undefined)?.[index] ?? 'center')), eyebrow: String(content.eyebrow ?? ''), headline: String(content.headline ?? page.title ?? ''), body, quote: String(content.quote ?? ''), footer: String(content.footer ?? ''), copy: body, products: Array.isArray(content.products) ? content.products as MagazineProductContent[] : undefined }
}

function pagePayload(draft: MagazinePageDraft) {
  const images = [...new Set([draft.imageUrl, ...draft.images].map((image) => image.trim()).filter(Boolean))]
  return { position: draft.position, pageType: draft.pageType, title: draft.title.trim() || null, imageUrl: images[0] || null, content: { schema_version: 1, layout: draft.layout || undefined, eyebrow: draft.eyebrow, headline: draft.headline, body: draft.body, copy: draft.body, quote: draft.quote, footer: draft.footer, products: draft.products, images, imagePositions: images.map((_, index) => draft.imagePositions[index] || 'center') } }
}

function inlineTextValue(draft: MagazinePageDraft, selection: MagazineEditSelection) {
  if (selection.field === 'productName' || selection.field === 'productDescription' || selection.field === 'productPrice') {
    const index = selection.productIndex ?? 0
    const defaults = DEFAULT_MAGAZINE_PRODUCTS[draft.layout] ?? []
    const product = draft.products?.[index] ?? defaults[index]
    const key = selection.field === 'productName' ? 'name' : selection.field === 'productDescription' ? 'description' : 'price'
    return product?.[key] ?? ''
  }
  if (selection.field === 'image') return ''
  return draft[selection.field]
}

function pageFromDraft(page: MagazinePage, draft: MagazinePageDraft): MagazinePage {
  const payload = pagePayload(draft)
  return { ...page, pageType: payload.pageType, title: payload.title, imageUrl: payload.imageUrl, content: payload.content }
}
