import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import type { Magazine, MagazinePage } from '../../types'
import type { TFn } from '../../lib/i18n'
import { fileToDataUrl } from '../../lib/image'
import { Icon } from '../../screens/admin/crm/ui'
import { gradient } from '../../screens/admin/crm/theme'
import {
  MAGAZINE_TEMPLATES,
  pageContent,
  type MagazineProductContent,
} from './templateCatalog'

export type MagazineMetadataDraft = {
  name: string
  issue: string
  description: string
  design: string
  coverImageUrl: string
  published: boolean
  showOnIndex: boolean
}

export type MagazinePageDraft = {
  position: number
  pageType: string
  layout: string
  title: string
  imageUrl: string
  images: string[]
  imagePositions: string[]
  eyebrow: string
  headline: string
  body: string
  quote: string
  footer: string
  copy: string
  products?: MagazineProductContent[]
}

type Result<T> = { data?: T; error?: string }
type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
type PageEditorHandle = { saveNow: () => Promise<boolean> }

export function MagazineEditor({
  magazine,
  onClose,
  onSaveMagazine,
  onCreatePage,
  onSavePage,
  onDeletePage,
  t,
}: {
  magazine: Magazine | null
  onClose: () => void
  onSaveMagazine: (draft: MagazineMetadataDraft) => Promise<Result<Magazine>>
  onCreatePage: (draft: MagazinePageDraft) => Promise<Result<MagazinePage>>
  onSavePage: (
    pageId: string,
    draft: MagazinePageDraft
  ) => Promise<Result<MagazinePage>>
  onDeletePage: (pageId: string) => Promise<Result<{ deleted: boolean }>>
  t: TFn
}) {
  const isCheeseFactoryJournal = magazine?.slug === 'the_cheese_factory_journal'
  const [metadata, setMetadata] = useState<MagazineMetadataDraft>(() =>
    metadataFrom(magazine)
  )
  const [pages, setPages] = useState(() =>
    [...(magazine?.pages ?? [])].sort((a, b) => a.position - b.position)
  )
  const [screen, setScreen] = useState<'metadata' | 'pages'>('metadata')
  const [pageIndex, setPageIndex] = useState(0)
  const [savingMetadata, setSavingMetadata] = useState(false)
  const [savingPage, setSavingPage] = useState<string | null>(null)
  const [addingPage, setAddingPage] = useState(false)
  const [metadataStatus, setMetadataStatus] = useState<SaveStatus>(
    magazine ? 'saved' : 'idle'
  )
  const [navigating, setNavigating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const metadataRef = useRef(metadata)
  const metadataSavePromiseRef = useRef<Promise<Result<Magazine>> | null>(null)
  const metadataHydratedRef = useRef(false)
  const pageEditorRef = useRef<PageEditorHandle | null>(null)
  const tRef = useRef(t)
  const saveMagazineRef = useRef(onSaveMagazine)

  const updateMetadata = <K extends keyof MagazineMetadataDraft>(
    key: K,
    value: MagazineMetadataDraft[K]
  ) => {
    setMetadata((current) => ({ ...current, [key]: value }))
  }

  const saveMetadata = useCallback(
    async (draft = metadataRef.current): Promise<Result<Magazine>> => {
      if (!draft.name.trim()) {
        const response = { error: tRef.current('magazines.nameRequired') }
        setMetadataStatus('error')
        return response
      }
      if (metadataSavePromiseRef.current) return metadataSavePromiseRef.current
      setSavingMetadata(true)
      setMetadataStatus('saving')
      setError(null)
      const promise = saveMagazineRef
        .current({ ...draft, name: draft.name.trim() })
        .then((response) => {
          setSavingMetadata(false)
          const failed = Boolean(response.error || !response.data)
          setMetadataStatus(failed ? 'error' : 'saved')
          if (response.error) setError(response.error)
          return response
        })
        .catch((reason: unknown) => {
          setSavingMetadata(false)
          setMetadataStatus('error')
          const response = {
            error:
              reason instanceof Error
                ? reason.message
                : tRef.current('common.error'),
          }
          setError(response.error)
          return response
        })
      metadataSavePromiseRef.current = promise
      void promise.then(() => {
        if (metadataSavePromiseRef.current === promise)
          metadataSavePromiseRef.current = null
      })
      return promise
    },
    []
  )

  useEffect(() => {
    metadataRef.current = metadata
    tRef.current = t
    saveMagazineRef.current = onSaveMagazine
  }, [metadata, onSaveMagazine, t])

  useEffect(() => {
    if (!metadataHydratedRef.current) {
      metadataHydratedRef.current = true
      return
    }
    if (!magazine || !metadata.name.trim()) return
    setMetadataStatus('dirty')
    const timeout = window.setTimeout(() => void saveMetadata(), 850)
    return () => window.clearTimeout(timeout)
  }, [magazine, metadata, saveMetadata])

  const continueToPages = async () => {
    const response = await saveMetadata()
    if (response.data) {
      setPages([...response.data.pages].sort((a, b) => a.position - b.position))
      setScreen('pages')
    }
  }

  const addPage = async () => {
    if (!magazine) return
    setAddingPage(true)
    setError(null)
    const position = pages.length
      ? Math.max(...pages.map((page) => page.position)) + 1
      : 0
    const blank = pageDraftFrom({
      id: '',
      magazineId: magazine.id,
      position,
      pageType: 'editorial',
      title: null,
      imageUrl: null,
      content: null,
    })
    const response = await onCreatePage(blank)
    setAddingPage(false)
    if (response.data) {
      const nextPages = [...pages, response.data].sort(
        (a, b) => a.position - b.position
      )
      setPages(nextPages)
      setPageIndex(nextPages.findIndex((page) => page.id === response.data?.id))
    } else setError(response.error ?? null)
  }

  const savePage = async (page: MagazinePage, draft: MagazinePageDraft) => {
    setSavingPage(page.id)
    setError(null)
    const response = await onSavePage(page.id, draft)
    setSavingPage(null)
    if (response.data)
      setPages((current) =>
        current
          .map((item) => (item.id === page.id ? response.data! : item))
          .sort((a, b) => a.position - b.position)
      )
    else setError(response.error ?? null)
    return response
  }

  const deletePage = async (page: MagazinePage) => {
    if (
      !window.confirm(
        t('magazines.deletePageConfirm', {
          title: page.title || t('magazines.untitledPage'),
        })
      )
    )
      return
    setSavingPage(page.id)
    setError(null)
    const response = await onDeletePage(page.id)
    setSavingPage(null)
    if (response.data) {
      setPages((current) => current.filter((item) => item.id !== page.id))
      setPageIndex((current) =>
        Math.max(
          0,
          current -
            (current >= pages.findIndex((item) => item.id === page.id) ? 1 : 0)
        )
      )
    } else setError(response.error ?? null)
  }

  const safePageIndex = Math.min(pageIndex, Math.max(0, pages.length - 1))
  const currentPage = pages[safePageIndex]

  const flushPage = async () => {
    if (!currentPage || !pageEditorRef.current) return true
    setNavigating(true)
    const saved = await pageEditorRef.current.saveNow()
    setNavigating(false)
    return saved
  }

  const goToPage = async (index: number) => {
    if (index === safePageIndex || navigating) return
    if (await flushPage()) setPageIndex(index)
  }

  const goToMetadata = async () => {
    if (navigating) return
    if (screen === 'pages' && !(await flushPage())) return
    setScreen('metadata')
  }

  const closeEditor = async () => {
    if (navigating) return
    if (screen === 'pages' && !(await flushPage())) return
    if (screen === 'metadata' && magazine) {
      const response = await saveMetadata()
      if (!response.data) return
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-black/60 p-3 sm:flex sm:items-center sm:justify-center sm:p-6"
      onMouseDown={() => void closeEditor()}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="my-0 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-y-auto rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 shadow-2xl sm:my-auto sm:max-h-[calc(100dvh-3rem)] sm:p-6"
      >
        <div className="mb-5 flex shrink-0 items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--dash-muted)]">
              {t('magazines.eyebrow')}
            </p>
            <h2 className="mt-1 text-xl font-bold text-[var(--dash-text)]">
              {screen === 'metadata'
                ? magazine
                  ? t('magazines.editTitle')
                  : t('magazines.newTitle')
                : t('magazines.pagesTitle')}
            </h2>
            <p className="mt-1 text-sm text-[var(--dash-muted)]">
              {screen === 'metadata'
                ? t('magazines.editorDescription')
                : t('magazines.pagesDescription')}
            </p>
            {screen === 'metadata' && (
              <SaveStatus status={metadataStatus} t={t} />
            )}
          </div>
          <button
            type="button"
            onClick={() => void closeEditor()}
            disabled={navigating}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--dash-muted)] transition hover:bg-[var(--dash-soft)] hover:text-[var(--dash-text)] disabled:opacity-40"
          >
            <Icon name="circle-x" size={20} />
          </button>
        </div>

        <nav
          className="mb-6 flex shrink-0 items-center gap-1.5 border-b border-[var(--dash-border)] pb-3"
          aria-label={t('magazines.editorSteps')}
        >
          <button
            type="button"
            onClick={() => void goToMetadata()}
            disabled={navigating}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${screen === 'metadata' ? 'bg-violet-500/15 text-violet-300' : 'text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] disabled:opacity-40'}`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-[10px]">
              1
            </span>
            {t('magazines.editTitle')}
          </button>
          <span
            className="px-1 text-xs text-[var(--dash-muted)]/50"
            aria-hidden="true"
          >
            /
          </span>
          <button
            type="button"
            disabled={!magazine || navigating}
            onClick={() => setScreen('pages')}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${screen === 'pages' ? 'bg-violet-500/15 text-violet-300' : 'text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] disabled:cursor-not-allowed disabled:opacity-40'}`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-[10px]">
              2
            </span>
            {t('magazines.pagesTitle')}
          </button>
        </nav>

        {screen === 'metadata' && (
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="flex flex-col gap-4">
              <Field label={t('magazines.name')}>
                <input
                  autoFocus
                  value={metadata.name}
                  onChange={(event) =>
                    updateMetadata('name', event.target.value)
                  }
                  className={inputClass}
                  placeholder="The Cheese Factory Journal"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('magazines.issue')}>
                  <input
                    value={metadata.issue}
                    onChange={(event) =>
                      updateMetadata('issue', event.target.value)
                    }
                    className={inputClass}
                    placeholder="Issue 01 · Autumn"
                  />
                </Field>
                <Field label={t('magazines.coverImage')}>
                  <ImageField
                    value={metadata.coverImageUrl}
                    onChange={(value) => updateMetadata('coverImageUrl', value)}
                    t={t}
                  />
                </Field>
              </div>
              <Field label={t('magazines.description')}>
                <textarea
                  value={metadata.description}
                  onChange={(event) =>
                    updateMetadata('description', event.target.value)
                  }
                  className={`${inputClass} min-h-24 resize-y`}
                  placeholder={t('magazines.descriptionPlaceholder')}
                />
              </Field>
              <div className="flex flex-wrap gap-4">
                <Check
                  checked={metadata.published}
                  onChange={(value) => updateMetadata('published', value)}
                >
                  {t('magazines.publishedLabel')}
                </Check>
                <Check
                  checked={metadata.showOnIndex}
                  onChange={(value) => updateMetadata('showOnIndex', value)}
                >
                  {t('magazines.indexLabel')}
                </Check>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold text-[var(--dash-text2)]">
                {t('magazines.template')}
              </p>
              <div className="flex flex-col gap-2">
                {(isCheeseFactoryJournal
                  ? MAGAZINE_TEMPLATES.filter(
                      (template) => template.id === 'pencil-journal'
                    )
                  : MAGAZINE_TEMPLATES
                ).map((template) => (
                  <label
                    key={template.id}
                    className={`cursor-pointer rounded-xl border p-3 transition ${metadata.design === template.id ? 'border-violet-400 bg-violet-500/10' : 'border-[var(--dash-border)] hover:border-violet-400/50'}`}
                  >
                    <input
                      type="radio"
                      name="magazine-template"
                      value={template.id}
                      checked={metadata.design === template.id}
                      onChange={() => updateMetadata('design', template.id)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-bold text-[var(--dash-text)]">
                      {t(template.nameKey)}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--dash-muted)]">
                      {t(template.descriptionKey)}
                    </span>
                  </label>
                ))}
              </div>
              {isCheeseFactoryJournal && (
                <p className="mt-2 text-xs leading-5 text-[var(--dash-muted)]">
                  {t('magazines.templateFixed')}
                </p>
              )}
            </div>
          </section>
        )}

        {screen === 'pages' && (
          <section className="pt-1">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[var(--dash-text)]">
                  {t('magazines.pagesTitle')}
                </h3>
                <p className="mt-1 text-sm text-[var(--dash-muted)]">
                  {t('magazines.pagesDescription')}
                </p>
              </div>
              {magazine && (
                <button
                  type="button"
                  onClick={() => void addPage()}
                  disabled={addingPage}
                  className="flex h-9 items-center gap-1.5 rounded-lg bg-[var(--dash-soft)] px-3 text-xs font-bold text-[var(--dash-text)] disabled:opacity-50"
                >
                  <Icon name="plus" size={14} />{' '}
                  {addingPage ? t('common.saving') : t('magazines.addPage')}
                </button>
              )}
            </div>
            {!magazine ? (
              <p className="mt-4 rounded-xl bg-[var(--dash-soft)] p-4 text-sm text-[var(--dash-muted)]">
                {t('magazines.saveBeforePages')}
              </p>
            ) : pages.length === 0 ? (
              <p className="mt-4 rounded-xl bg-[var(--dash-soft)] p-4 text-sm text-[var(--dash-muted)]">
                {t('magazines.noPages')}
              </p>
            ) : (
              <>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-3">
                  <button
                    type="button"
                    disabled={pageIndex === 0 || navigating}
                    onClick={() =>
                      void goToPage(Math.max(0, safePageIndex - 1))
                    }
                    className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:opacity-30"
                  >
                    <Icon name="chevron-left" size={15} />{' '}
                    {t('magazines.previousPage')}
                  </button>
                  <div className="min-w-0 flex-1">
                    <label className="sr-only" htmlFor="magazine-page-selector">
                      {t('magazines.choosePage')}
                    </label>
                    <select
                      id="magazine-page-selector"
                      value={safePageIndex}
                      onChange={(event) =>
                        void goToPage(Number(event.target.value))
                      }
                      disabled={navigating}
                      className="h-9 w-full min-w-0 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-text)] outline-none focus:border-violet-400 disabled:opacity-50"
                    >
                      {pages.map((page, index) => (
                        <option key={page.id} value={index}>
                          {t('magazines.pageNumber', { number: index + 1 })} ·{' '}
                          {page.title || t('magazines.untitledPage')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={pageIndex === pages.length - 1 || navigating}
                    onClick={() =>
                      void goToPage(
                        Math.min(pages.length - 1, safePageIndex + 1)
                      )
                    }
                    className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:opacity-30"
                  >
                    {t('magazines.nextPage')}{' '}
                    <Icon name="chevron-right" size={15} />
                  </button>
                </div>
                {currentPage && (
                  <PageEditor
                    ref={pageEditorRef}
                    key={currentPage.id}
                    page={currentPage}
                    saving={savingPage === currentPage.id}
                    onSave={(draft) => savePage(currentPage, draft)}
                    onDelete={() => void deletePage(currentPage)}
                    t={t}
                  />
                )}
              </>
            )}
          </section>
        )}

        {error && (
          <p className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm font-semibold text-red-300">
            {error}
          </p>
        )}
        <div className="mt-6 flex shrink-0 justify-end gap-2 border-t border-[var(--dash-border)] pt-4">
          {screen === 'metadata' ? (
            <>
              <button
                type="button"
                onClick={() => void closeEditor()}
                disabled={navigating}
                className="h-10 rounded-lg px-4 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:opacity-40"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void continueToPages()}
                disabled={savingMetadata || !metadata.name.trim()}
                className={`h-10 rounded-lg px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${gradient}`}
              >
                {savingMetadata
                  ? t('common.saving')
                  : t('magazines.continueToPages')}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void goToMetadata()}
                disabled={navigating}
                className="inline-flex h-10 items-center gap-1 rounded-lg px-4 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:opacity-40"
              >
                <Icon name="chevron-left" size={15} />{' '}
                {t('magazines.backToMagazine')}
              </button>
              <button
                type="button"
                onClick={() => void closeEditor()}
                disabled={navigating}
                className={`h-10 rounded-lg px-5 text-sm font-bold text-white disabled:opacity-50 ${gradient}`}
              >
                {t('common.done')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const PageEditor = forwardRef<
  PageEditorHandle,
  {
    page: MagazinePage
    saving: boolean
    onSave: (draft: MagazinePageDraft) => Promise<Result<MagazinePage>>
    onDelete: () => void
    t: TFn
  }
>(function PageEditor({ page, saving, onSave, onDelete, t }, ref) {
  const [draft, setDraft] = useState<MagazinePageDraft>(() =>
    pageDraftFrom(page)
  )
  const [status, setStatus] = useState<SaveStatus>('saved')
  const draftRef = useRef(draft)
  const onSaveRef = useRef(onSave)
  const dirtyRef = useRef(false)
  const hydratedRef = useRef(false)
  const saveTimerRef = useRef<number | null>(null)
  const savePromiseRef = useRef<Promise<boolean> | null>(null)
  const changeDraft = (
    updater: (current: MagazinePageDraft) => MagazinePageDraft
  ) => {
    dirtyRef.current = true
    setStatus('dirty')
    setDraft(updater)
  }
  const update = <K extends keyof MagazinePageDraft>(
    key: K,
    value: MagazinePageDraft[K]
  ) => changeDraft((current) => ({ ...current, [key]: value }))
  const previewImages = draft.images.length
    ? draft.images
    : draft.imageUrl.trim()
      ? [draft.imageUrl.trim()]
      : []
  const previewPositions = previewImages.map(
    (_, index) => draft.imagePositions[index] || 'center'
  )
  const updatePrimaryImage = (value: string) =>
    changeDraft((current) => {
      const images = current.images.length
        ? [...current.images]
        : current.imageUrl.trim()
          ? [current.imageUrl]
          : []
      if (value.trim()) images[0] = value
      else images.shift()
      return {
        ...current,
        imageUrl: value,
        images,
        imagePositions: images.map(
          (_, index) => current.imagePositions[index] || 'center'
        ),
      }
    })
  const updateAdditionalImages = (value: string) =>
    changeDraft((current) => {
      const primary = current.images[0] || current.imageUrl.trim()
      const pencilAssets = current.images.slice(1).filter(isPencilAsset)
      const additional = value
        .split('\n')
        .map((source) => source.trim())
        .filter(Boolean)
      const images = [
        ...new Set([primary, ...pencilAssets, ...additional].filter(Boolean)),
      ]
      return {
        ...current,
        imageUrl: images[0] || '',
        images,
        imagePositions: images.map(
          (_, index) => current.imagePositions[index] || 'center'
        ),
      }
    })
  const moveImage = (index: number, direction: -1 | 1) =>
    changeDraft((current) => {
      const target = index + direction
      if (target < 0 || target >= current.images.length) return current
      const images = [...current.images]
      const imagePositions = [...current.imagePositions]
      ;[images[index], images[target]] = [images[target], images[index]]
      ;[imagePositions[index], imagePositions[target]] = [
        imagePositions[target] || 'center',
        imagePositions[index] || 'center',
      ]
      return { ...current, imageUrl: images[0] || '', images, imagePositions }
    })
  const removeImage = (index: number) =>
    changeDraft((current) => {
      const images = current.images.filter(
        (_, imageIndex) => imageIndex !== index
      )
      const imagePositions = current.imagePositions.filter(
        (_, imageIndex) => imageIndex !== index
      )
      return { ...current, imageUrl: images[0] || '', images, imagePositions }
    })
  const updateImagePosition = (index: number, position: string) =>
    changeDraft((current) => {
      const imagePositions = [...current.imagePositions]
      imagePositions[index] = position
      return { ...current, imagePositions }
    })
  const saveNow = useCallback(async () => {
    if (!dirtyRef.current) return true
    if (savePromiseRef.current) return savePromiseRef.current
    const snapshot = draftRef.current
    setStatus('saving')
    const promise = onSaveRef
      .current(snapshot)
      .then((response) => {
        if (response.error || !response.data) {
          dirtyRef.current = true
          setStatus('error')
          return false
        }
        if (draftRef.current === snapshot) {
          dirtyRef.current = false
          setStatus('saved')
        } else setStatus('dirty')
        return true
      })
      .catch(() => {
        dirtyRef.current = true
        setStatus('error')
        return false
      })
    savePromiseRef.current = promise
    void promise.then(() => {
      if (savePromiseRef.current === promise) savePromiseRef.current = null
    })
    return promise
  }, [])

  useImperativeHandle(ref, () => ({ saveNow }), [saveNow])

  useEffect(() => {
    draftRef.current = draft
    onSaveRef.current = onSave
  }, [draft, onSave])

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true
      return
    }
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => void saveNow(), 850)
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    }
  }, [draft, saveNow])

  return (
    <article className="mt-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--dash-muted)]">
            {t('magazines.pageNumber', { number: page.position + 1 })}
          </span>
          <h4 className="mt-1 font-bold text-[var(--dash-text)]">
            {draft.title || t('magazines.untitledPage')}
          </h4>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={saving}
          className="text-[var(--dash-muted)] hover:text-red-300 disabled:opacity-50"
          aria-label={t('magazines.deletePage')}
        >
          <Icon name="circle-x" size={18} />
        </button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)]">
        <div>
          <ImageField
            value={draft.imageUrl}
            onChange={updatePrimaryImage}
            t={t}
          />
          <div className="mt-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--dash-text2)]">
                {t('magazines.imagePreview')}
              </p>
              <span className="rounded-full bg-[var(--dash-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--dash-muted)]">
                {previewImages.length}
              </span>
            </div>
            {previewImages.length ? (
              <div className="grid grid-cols-3 gap-2">
                {previewImages.map((source, index) => (
                  <div key={`${source}-${index}`} className="min-w-0">
                    <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)]">
                      <img
                        src={source}
                        alt={t('magazines.imageNumber', { number: index + 1 })}
                        className="h-full w-full object-cover"
                        style={{ objectPosition: previewPositions[index] }}
                      />
                      <span className="absolute bottom-1 left-1 max-w-[calc(100%-0.5rem)] truncate rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {index === 0
                          ? t('magazines.primaryImage')
                          : String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        className="rounded px-1 text-sm leading-none text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)] disabled:opacity-25"
                        aria-label={t('magazines.moveImageUp')}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === previewImages.length - 1}
                        className="rounded px-1 text-sm leading-none text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)] disabled:opacity-25"
                        aria-label={t('magazines.moveImageDown')}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="rounded px-1 text-sm leading-none text-[var(--dash-muted)] hover:bg-red-500/10 hover:text-red-300"
                        aria-label={t('magazines.removeImage')}
                      >
                        ×
                      </button>
                    </div>
                    <label className="mt-1 block">
                      <span className="sr-only">
                        {t('magazines.imagePosition')}
                      </span>
                      <select
                        value={previewPositions[index]}
                        onChange={(event) =>
                          updateImagePosition(index, event.target.value)
                        }
                        className="w-full rounded border border-[var(--dash-border)] bg-[var(--dash-bg)] px-1 py-1 text-[10px] font-semibold text-[var(--dash-text2)] outline-none focus:border-violet-400"
                      >
                        {IMAGE_POSITIONS.map(({ value, label }) => (
                          <option key={value} value={value}>
                            {t(label)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-[var(--dash-border)] px-2 text-center text-xs text-[var(--dash-muted)]">
                {t('magazines.noImages')}
              </div>
            )}
          </div>
          <Field label={t('magazines.additionalImages')}>
            <textarea
              value={draft.images
                .slice(1)
                .filter((source) => !isPencilAsset(source))
                .join('\n')}
              onChange={(event) => updateAdditionalImages(event.target.value)}
              className={`${inputClass} mt-1 min-h-24 resize-y`}
              placeholder="https://…"
            />
          </Field>
          <p className="mt-1 text-[11px] leading-4 text-[var(--dash-muted)]">
            {t('magazines.additionalImagesHint')}{' '}
            {t('magazines.imageControlsHint')}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('magazines.pageTemplate')}>
            <input
              value={draft.pageType}
              onChange={(event) => update('pageType', event.target.value)}
              className={inputClass}
              placeholder={t('magazines.pageTemplatePlaceholder')}
            />
          </Field>
          <Field label={t('magazines.pageTitle')}>
            <input
              value={draft.title}
              onChange={(event) => update('title', event.target.value)}
              className={inputClass}
              placeholder={t('magazines.pageTitlePlaceholder')}
            />
          </Field>
          <Field label={t('magazines.pageEyebrow')}>
            <input
              value={draft.eyebrow}
              onChange={(event) => update('eyebrow', event.target.value)}
              className={inputClass}
              placeholder={t('magazines.pageEyebrowPlaceholder')}
            />
          </Field>
          <Field label={t('magazines.pageHeadline')}>
            <input
              value={draft.headline}
              onChange={(event) => update('headline', event.target.value)}
              className={inputClass}
              placeholder={t('magazines.pageHeadlinePlaceholder')}
            />
          </Field>
          <Field label={t('magazines.pageBody')}>
            <textarea
              value={draft.body}
              onChange={(event) => update('body', event.target.value)}
              className={`${inputClass} min-h-36 resize-y sm:col-span-2`}
              placeholder={t('magazines.pageBodyPlaceholder')}
            />
          </Field>
          <Field label={t('magazines.pageQuote')}>
            <textarea
              value={draft.quote}
              onChange={(event) => update('quote', event.target.value)}
              className={`${inputClass} min-h-20 resize-y`}
              placeholder={t('magazines.pageQuotePlaceholder')}
            />
          </Field>
          <Field label={t('magazines.pageFooter')}>
            <input
              value={draft.footer}
              onChange={(event) => update('footer', event.target.value)}
              className={inputClass}
              placeholder={t('magazines.pageFooterPlaceholder')}
            />
          </Field>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--dash-border)] pt-4">
        <div>
          <p className="text-xs text-[var(--dash-muted)]">
            {t('magazines.pageWizardHint')}
          </p>
          <SaveStatus status={status} t={t} />
        </div>
        <button
          type="button"
          onClick={() => void saveNow()}
          disabled={
            saving ||
            status === 'saving' ||
            (status !== 'dirty' && status !== 'error')
          }
          className={`h-9 rounded-lg px-3 text-xs font-bold text-white disabled:opacity-50 ${gradient}`}
        >
          {status === 'saving' || saving
            ? t('magazines.savingChanges')
            : t('magazines.saveNow')}
        </button>
      </div>
    </article>
  )
})

function SaveStatus({ status, t }: { status: SaveStatus; t: TFn }) {
  const label =
    status === 'saving'
      ? t('magazines.autosaveSaving')
      : status === 'dirty'
        ? t('magazines.autosaveUnsaved')
        : status === 'error'
          ? t('magazines.autosaveError')
          : status === 'saved'
            ? t('magazines.autosaveSaved')
            : t('magazines.autosaveManual')
  const color =
    status === 'error'
      ? 'text-red-300'
      : status === 'saving'
        ? 'text-amber-300'
        : status === 'dirty'
          ? 'text-violet-300'
          : 'text-emerald-300'
  return (
    <p
      className={`mt-1 flex items-center gap-1.5 text-[11px] font-semibold ${color}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </p>
  )
}

function ImageField({
  value,
  onChange,
  t,
}: {
  value: string
  onChange: (value: string) => void
  t: TFn
}) {
  const [reading, setReading] = useState(false)
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setReading(true)
    try {
      onChange(await fileToDataUrl(file, 1600))
    } finally {
      setReading(false)
      event.target.value = ''
    }
  }
  return (
    <div className="flex flex-col gap-1.5">
      <input
        value={isPencilAsset(value) ? '' : value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        placeholder="https://…"
      />
      <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-[var(--dash-link)] hover:underline">
        <Icon name="upload" size={13} />{' '}
        {reading ? t('magazines.loadingImage') : t('magazines.uploadImage')}
        <input
          type="file"
          accept="image/*"
          onChange={(event) => void handleFile(event)}
          className="sr-only"
        />
      </label>
    </div>
  )
}

function isPencilAsset(value: string) {
  return value.startsWith('/pencil/')
}

function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  children: ReactNode
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--dash-text2)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-violet-500"
      />
      {children}
    </label>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--dash-text2)]">
      {label}
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2.5 text-sm font-medium text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)] focus:border-violet-400'

const IMAGE_POSITIONS = [
  { value: 'center', label: 'magazines.imagePositionCenter' },
  { value: 'top', label: 'magazines.imagePositionTop' },
  { value: 'bottom', label: 'magazines.imagePositionBottom' },
  { value: 'left', label: 'magazines.imagePositionLeft' },
  { value: 'right', label: 'magazines.imagePositionRight' },
  { value: 'top left', label: 'magazines.imagePositionTopLeft' },
  { value: 'top right', label: 'magazines.imagePositionTopRight' },
  { value: 'bottom left', label: 'magazines.imagePositionBottomLeft' },
  { value: 'bottom right', label: 'magazines.imagePositionBottomRight' },
]

function metadataFrom(magazine: Magazine | null): MagazineMetadataDraft {
  return {
    name: magazine?.name ?? '',
    issue: magazine?.issue ?? '',
    description: magazine?.description ?? '',
    design:
      magazine?.slug === 'the_cheese_factory_journal'
        ? 'pencil-journal'
        : (magazine?.design ?? 'pencil-journal'),
    coverImageUrl: magazine?.coverImageUrl ?? '',
    published: Boolean(magazine?.published),
    showOnIndex: Boolean(magazine?.showOnIndex),
  }
}

function pageDraftFrom(page: MagazinePage): MagazinePageDraft {
  const content = pageContent(page.content)
  const body = content.body || content.copy || ''
  const contentImages = content.images ?? []
  const positionByImage = new Map(
    contentImages.map((source, index) => [
      source.trim(),
      content.imagePositions?.[index] || 'center',
    ])
  )
  const images = [
    ...new Set(
      [page.imageUrl ?? '', ...contentImages]
        .map((source) => source.trim())
        .filter(Boolean)
    ),
  ]
  return {
    position: page.position,
    pageType: page.pageType || 'editorial',
    layout: content.layout ?? '',
    title: page.title ?? content.headline ?? '',
    imageUrl: images[0] ?? '',
    images,
    imagePositions: images.map(
      (source) => positionByImage.get(source) || 'center'
    ),
    eyebrow: content.eyebrow ?? '',
    headline: content.headline ?? page.title ?? '',
    body,
    quote: content.quote ?? '',
    footer: content.footer ?? '',
    copy: body,
    products: content.products,
  }
}
