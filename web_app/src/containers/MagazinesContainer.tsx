import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { selectCanEdit, selectTenant } from '../store/slices/authSlice'
import api from '../services/api'
import type { Magazine, MagazinePage } from '../types'
import { useT, type TFn } from '../lib/i18n'
import { CrmLayout } from '../screens/admin/crm/CrmLayout'
import { Icon } from '../screens/admin/crm/ui'
import { gradient, tone } from '../screens/admin/crm/theme'
import { MagazineCard } from '../components/magazine/MagazineCard'
import { MagazineEditor, type MagazineMetadataDraft, type MagazinePageDraft } from '../components/magazine/MagazineEditor'

type Result<T> = { data?: T; error?: string }

export function MagazinesContainer() {
  const t = useT()
  const navigate = useNavigate()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Magazine | null>(null)
  const [creating, setCreating] = useState(false)
  const tenantId = tenant?.id

  const loadMagazines = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    const response = await api.getMagazines(tenantId)
    if (response.data) {
      setMagazines(response.data)
      setError(null)
    } else setError(response.error)
    setLoading(false)
  }, [tenantId])

  // Loading server state is intentionally triggered by the tenant change.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadMagazines() }, [loadMagazines])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return magazines
    return magazines.filter((magazine) => [magazine.name, magazine.slug, magazine.issue].some((value) => value?.toLowerCase().includes(query)))
  }, [magazines, search])

  const closeEditor = () => {
    setCreating(false)
    setEditing(null)
    void loadMagazines()
  }
  const replace = (magazine: Magazine) => setMagazines((rows) => replaceMagazine(rows, magazine))

  const saveMagazine = async (draft: MagazineMetadataDraft): Promise<Result<Magazine>> => {
    const response = editing
      ? await api.updateMagazine(editing.id, draft)
      : tenant?.id
        ? await api.createMagazine(tenant.id, draft)
        : { error: t('common.error') }
    if (response.data) {
      replace(response.data)
      setEditing(response.data)
      setCreating(false)
    }
    return response
  }

  const createPage = async (draft: MagazinePageDraft): Promise<Result<MagazinePage>> => {
    if (!editing) return { error: t('magazines.saveBeforePages') }
    const response = await api.createMagazinePage(editing.id, toPagePayload(draft))
    if (response.data) setEditing((current) => current ? { ...current, pages: [...current.pages, response.data!] } : current)
    return response
  }

  const savePage = async (pageId: string, draft: MagazinePageDraft): Promise<Result<MagazinePage>> => {
    const response = await api.updateMagazinePage(pageId, toPagePayload(draft))
    if (response.data) setEditing((current) => current ? { ...current, pages: current.pages.map((page) => page.id === pageId ? response.data! : page) } : current)
    return response
  }

  const deletePage = async (pageId: string): Promise<Result<{ deleted: boolean }>> => {
    const response = await api.deleteMagazinePage(pageId)
    if (response.data) setEditing((current) => current ? { ...current, pages: current.pages.filter((page) => page.id !== pageId) } : current)
    return response
  }

  const togglePublished = async (magazine: Magazine) => {
    const response = await api.updateMagazine(magazine.id, { published: !magazine.published })
    if (response.data) replace(response.data)
    else setError(response.error)
  }

  const toggleIndex = async (magazine: Magazine) => {
    const response = await api.updateMagazine(magazine.id, { showOnIndex: !magazine.showOnIndex })
    if (response.data) replace(response.data)
    else setError(response.error)
  }

  const deleteMagazine = async (magazine: Magazine) => {
    if (!window.confirm(t('magazines.deleteConfirm', { name: magazine.name }))) return
    const response = await api.deleteMagazine(magazine.id)
    if (response.data) setMagazines((rows) => rows.filter((row) => row.id !== magazine.id))
    else setError(response.error)
  }

  return (
    <CrmLayout active="Revistas" title={t('nav.magazines')} subtitle={t('magazines.subtitle')} searchPlaceholder={t('magazines.search')} searchValue={search} onSearchChange={setSearch} hideContext>
      <main className="flex min-h-full flex-col gap-5 px-4 py-6 md:px-10 md:py-8">
        <section className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--dash-muted)]">{t('magazines.eyebrow')}</p><h1 className="mt-2 text-[28px] font-bold leading-none text-[var(--dash-text)]">{t('nav.magazines')}</h1><p className="mt-2 max-w-2xl text-[13px] text-[var(--dash-muted)]">{t('magazines.description')}</p></div>{canEdit && <button type="button" onClick={() => { setEditing(null); setCreating(true) }} className={`flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px] font-bold text-white ${gradient}`}><Icon name="plus" size={15} /> {t('magazines.new')}</button>}</section>
        {error && <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--tone-red-fg)]/25 p-4 text-sm" style={tone('red')}><span>{error}</span><button type="button" onClick={() => void loadMagazines()} className="font-bold underline">{t('common.retry')}</button></div>}
        {loading ? <div className="flex h-40 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">{t('magazines.loading')}</div> : filtered.length === 0 ? <EmptyState hasRows={magazines.length > 0} onCreate={canEdit ? () => { setEditing(null); setCreating(true) } : undefined} t={t} /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((magazine) => <MagazineCard key={magazine.id} magazine={magazine} subdomain={tenant?.subdomain} canEdit={canEdit} onEdit={() => navigate(`/admin/magazines/${magazine.id}/edit`)} onTogglePublished={() => void togglePublished(magazine)} onToggleIndex={() => void toggleIndex(magazine)} onDelete={() => void deleteMagazine(magazine)} t={t} />)}</div>}
      </main>
      {(creating || editing) && <MagazineEditor magazine={editing} onClose={closeEditor} onSaveMagazine={saveMagazine} onCreatePage={createPage} onSavePage={savePage} onDeletePage={deletePage} t={t} />}
    </CrmLayout>
  )
}

function toPagePayload(draft: MagazinePageDraft) {
  const sourceImages = draft.images.length ? draft.images : [draft.imageUrl]
  const primaryImage = draft.imageUrl.trim() || sourceImages[0]?.trim() || ''
  const orderedImages = [primaryImage, ...sourceImages.map((source) => source.trim()).filter((source) => source !== primaryImage)].filter(Boolean)
  const positionByImage = new Map(sourceImages.map((source, index) => [source.trim(), draft.imagePositions[index] || 'center']))
  const imagePositions = orderedImages.map((source) => positionByImage.get(source) || 'center')
  return {
    position: draft.position,
    pageType: draft.pageType,
    title: draft.title.trim() || null,
    imageUrl: primaryImage || null,
    content: {
      schema_version: 1,
      layout: draft.layout.trim() || undefined,
      eyebrow: draft.eyebrow.trim(),
      headline: draft.headline.trim(),
      body: draft.body,
      copy: draft.body || draft.copy,
      quote: draft.quote.trim(),
      footer: draft.footer.trim(),
      products: draft.products,
      images: orderedImages,
      imagePositions,
    },
  }
}

function replaceMagazine(rows: Magazine[], magazine: Magazine) {
  const index = rows.findIndex((row) => row.id === magazine.id)
  return index === -1 ? [magazine, ...rows] : rows.map((row) => row.id === magazine.id ? magazine : row)
}

function EmptyState({ hasRows, onCreate, t }: { hasRows: boolean; onCreate?: () => void; t: TFn }) {
  return <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 text-center"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${gradient}`}><Icon name="book-open" size={22} /></span><div><p className="text-lg font-bold text-[var(--dash-text)]">{hasRows ? t('magazines.noResults') : t('magazines.emptyTitle')}</p>{!hasRows && <p className="mt-1 text-[13px] text-[var(--dash-muted)]">{t('magazines.emptyDescription')}</p>}</div>{!hasRows && onCreate && <button type="button" onClick={onCreate} className={`mt-2 flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold text-white ${gradient}`}><Icon name="plus" size={16} /> {t('magazines.new')}</button>}</div>
}
