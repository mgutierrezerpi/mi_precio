import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import { createList, updateList, deleteItem, createItem, fetchLists } from '../../store/slices/menuSlice'
import type { PriceList, Product, ListContent } from '../../types'
import api from '../../services/api'
import { useT } from '../../lib/i18n'
import { ListAppearanceFields } from '../../components/appearance/ListAppearanceFields'
import { hasOwnAppearance, type ListAppearance } from '../../lib/listAppearance'
import { ProductModal } from './ProductsScreen'
import { DashField } from './PriceListRows'
import { Icon } from './crm/ui'
import { tone, gradient } from './crm/theme'
import {
  ToggleRow,
  inputCls,
} from './PriceListEditorFields'
import { trackEvent } from '../../lib/analytics'
import { PriceListProductStep } from './PriceListProductStep'

const starterTemplateContent = (name: string): ListContent => ({
  schemaVersion: 1,
  hero: { title: name },
  blocks: [],
})

export function ListModal({
  list,
  initialStep,
  initialCustomize,
  tenantId,
  products,
  lists,
  onClose,
}: {
  list: PriceList | null
  initialStep: 1 | 2
  initialCustomize: boolean
  tenantId?: string
  products: Product[]
  lists: PriceList[]
  onClose: () => void
}) {
  const dispatch = useAppDispatch()
  const [, setWizardParams] = useSearchParams()
  const t = useT()
  const tenant = useAppSelector(selectTenant)
  const editing = !!list
  const [step, setStep] = useState<1 | 2>(initialStep)
  const [name, setName] = useState(list?.name ?? '')
  const [slug, setSlug] = useState(list?.slug ?? '')
  const [kind, setKind] = useState<'product' | 'service'>(
    list?.kind ?? 'product'
  )
  const [published, setPublished] = useState(list?.published ?? false)
  const [principal, setPrincipal] = useState(list?.showOnIndex ?? false)
  const [captureViewerInfo, setCaptureViewerInfo] = useState(
    list?.captureViewerInfo ?? false
  )
  const [parentListId, setParentListId] = useState(list?.parentListId ?? '')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [prodSearch, setProdSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  // Per-list appearance overrides. Null fields inherit the tenant's defaults,
  // so a list only carries what the user deliberately changed here.
  const [appearance, setAppearance] = useState<ListAppearance>({
    design: list?.design ?? null,
    heroColor: list?.heroColor ?? null,
    bgUrl: list?.bgUrl ?? null,
    bgOverlay: list?.bgOverlay ?? null,
  })
  const [showAppearance, setShowAppearance] = useState(false)
  const [showTemplateContent, setShowTemplateContent] =
    useState(initialCustomize)
  const [templateContent, setTemplateContent] = useState<ListContent | null>(
    null
  )
  const [contentRevision, setContentRevision] = useState(0)
  const [savingTemplateContent, setSavingTemplateContent] = useState(false)
  const versionId = useRef<string | undefined>(undefined)
  const [loadedItems, setLoadedItems] = useState<
    { id: string; name: string; productId: string | null }[]
  >([])

  // The product an item came from: by stable product id, else (legacy items with no
  // product_id) by name. Renaming a product no longer detaches it from the list.
  const productForItem = (it: {
    name: string
    productId: string | null
  }): Product | undefined =>
    it.productId
      ? products.find((p) => p.id === it.productId)
      : products.find(
          (p) => p.name.trim().toLowerCase() === it.name.trim().toLowerCase()
        )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // When editing, load the current version + its items once.
  useEffect(() => {
    if (!list) return
    let cancelled = false
    ;(async () => {
      const lres = await api.getList(list.id)
      const version = lres.data?.versions?.[0]
      const vid = version?.id
      if (!vid) return
      const ires = await api.getItems(vid)
      if (cancelled) return
      versionId.current = vid
      setTemplateContent(version?.content ?? starterTemplateContent(list.name))
      setContentRevision(version?.contentRevision ?? 0)
      setLoadedItems(
        (ires.data ?? []).map((i) => ({
          id: i.id,
          name: i.name,
          productId: i.productId,
        }))
      )
    })()
    return () => {
      cancelled = true
    }
  }, [list])

  // Pre-select the products already in the list (matched by id, name for legacy items).
  // Depends on `products` too, so the checkboxes recompute once the catalog finishes
  // loading — it may arrive after the modal opens, which used to leave everything unchecked.
  useEffect(() => {
    const inList = new Set(
      loadedItems.map((i) => productForItem(i)?.id).filter(Boolean)
    )
    setSelected(
      new Set(products.filter((p) => inList.has(p.id)).map((p) => p.id))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedItems, products])

  const filteredProducts = useMemo(() => {
    const q = prodSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) =>
      [p.name, p.sku, p.category].some((v) => v?.toLowerCase().includes(q))
    )
  }, [products, prodSearch])

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  const allShown =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selected.has(p.id))
  const toggleAll = () =>
    setSelected((s) => {
      const n = new Set(s)
      if (filteredProducts.every((p) => n.has(p.id)))
        filteredProducts.forEach((p) => n.delete(p.id))
      else filteredProducts.forEach((p) => n.add(p.id))
      return n
    })

  const changeStep = (next: 1 | 2) => {
    setStep(next)
    setWizardParams((current) => {
      if (next === 2) current.set('step', '2')
      else current.delete('step')
      return current
    })
  }

  const goNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) changeStep(2)
  }

  const updateTemplateContent = (patch: Partial<ListContent>) =>
    setTemplateContent((current) => ({
      ...(current ?? starterTemplateContent(list?.name ?? 'Mi lista')),
      ...patch,
    }))

  const updateTemplateHero = (
    key: 'eyebrow' | 'title' | 'body',
    value: string
  ) => {
    const current =
      templateContent ?? starterTemplateContent(list?.name ?? 'Mi lista')
    updateTemplateContent({ hero: { ...current.hero, [key]: value } })
  }

  const updateTemplateField = (
    key: keyof NonNullable<ListContent['template']>,
    value: string
  ) => {
    const current =
      templateContent ?? starterTemplateContent(list?.name ?? 'Mi lista')
    updateTemplateContent({ template: { ...current.template, [key]: value } })
  }

  const uploadTemplateImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !tenant?.id) return
    const response = await api.uploadListTemplateImage(tenant.id, file)
    event.target.value = ''
    if (!response.data) return
    updateTemplateField('image', response.data.url)
  }

  const saveTemplateContent = async () => {
    if (!versionId.current || !templateContent) return
    setSavingTemplateContent(true)
    try {
      const response = await api.updateVersionContent(
        versionId.current,
        templateContent,
        contentRevision
      )
      if (response.data) {
        setTemplateContent(response.data.content)
        setContentRevision(response.data.contentRevision)
      }
    } finally {
      setSavingTemplateContent(false)
    }
  }

  // Add the selected products as items / remove the ones deselected. Membership is
  // keyed off the product id (stable across renames); items store product_id and copy
  // the product's image so the public list shows the real photo, not a category icon.
  const syncItems = async (vid: string) => {
    const chosenIds = new Set(
      products.filter((p) => selected.has(p.id)).map((p) => p.id)
    )
    const representedIds = new Set(
      loadedItems.map((i) => productForItem(i)?.id).filter(Boolean)
    )
    // Create an item for every newly-selected product not already in the list.
    for (const p of products.filter(
      (p) => selected.has(p.id) && !representedIds.has(p.id)
    )) {
      await dispatch(
        createItem({
          versionId: vid,
          data: {
            name: p.name,
            price: parseFloat(p.price) || 0,
            description: p.description || undefined,
            category: p.category || undefined,
            imageUrl: p.imageUrl || undefined,
            imageThumbUrl: p.imageThumbUrl || undefined,
            productId: p.id,
          },
        })
      )
    }
    // Remove items whose product was deselected. Orphan/manual items (no matching
    // product) are left untouched.
    for (const it of loadedItems.filter((i) => {
      const p = productForItem(i)
      return p && !chosenIds.has(p.id)
    })) {
      await dispatch(deleteItem(it.id))
    }
  }

  const finalize = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await dispatch(
          updateList({
            listId: list!.id,
            data: {
              name: name.trim(),
              slug: slug.trim() || undefined,
              published,
              showOnIndex: principal,
              captureViewerInfo,
              kind,
              parentListId: parentListId || null,
              ...appearance,
            },
          })
        )
        if (versionId.current) await syncItems(versionId.current)
      } else if (tenantId) {
        const res = await dispatch(
          createList({ tenantId, name: name.trim(), kind })
        )
        if (createList.fulfilled.match(res) && res.payload) {
          const vid = res.payload.versions?.[0]?.id
          await dispatch(
            updateList({
              listId: res.payload.id,
              data: {
                slug: slug.trim() || undefined,
                published,
                showOnIndex: principal,
                captureViewerInfo,
                ...appearance,
              },
            })
          )
          if (vid) await syncItems(vid)
          trackEvent('Created Price List', {
            kind,
            published,
            is_primary: principal,
            initial_item_count: selected.size,
          })
        }
      }
      if (tenantId) dispatch(fetchLists(tenantId))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const panelWidth =
    step === 2
      ? 'max-w-[560px]'
      : showAppearance || showTemplateContent
        ? 'max-w-[720px]'
        : 'max-w-[440px]'
  const activeTemplateContent =
    templateContent ?? starterTemplateContent(list?.name ?? 'Mi lista')
  const selectedDesign = appearance.design ?? tenant?.listDesign
  const supportsEditorialContent =
    selectedDesign?.startsWith('pencil-') ?? false

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* max-h + scroll: with the appearance block open the panel is taller
          than the viewport, and the footer buttons must stay reachable. */}
      <div
        className={`dash max-h-[90vh] w-full ${panelWidth} animate-scale-in overflow-y-auto rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 font-sans shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)]`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-extrabold text-[var(--dash-text)]">
              {initialCustomize
                ? 'Personalizar lista'
                : step === 1
                  ? editing
                    ? t('pl.wizard.edit')
                    : t('pl.wizard.new')
                  : t('pl.wizard.chooseProducts')}
            </h3>
            <span className="text-xs font-medium text-[var(--dash-muted)]">
              {t('pl.wizard.step', { current: step, total: 2 })}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('pl.close')}
            title={t('pl.close')}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80"
          >
            ✕
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={goNext}>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[var(--dash-text2)]">
                  {t('pl.name')}
                </span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('pl.namePlaceholder')}
                  className={inputCls}
                  required
                />
              </label>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[var(--dash-text2)]">
                  {t('pl.type')}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      k: 'product' as const,
                      icon: 'package' as const,
                      title: t('pl.type.products'),
                      desc: t('pl.type.productsDesc'),
                    },
                    {
                      k: 'service' as const,
                      icon: 'sliders-horizontal' as const,
                      title: t('pl.type.services'),
                      desc: t('pl.type.servicesDesc'),
                    },
                  ].map((o) => {
                    const on = kind === o.k
                    return (
                      <button
                        key={o.k}
                        type="button"
                        onClick={() => setKind(o.k)}
                        className={`flex flex-col gap-1 rounded-xl border p-3 text-left ${on ? 'border-[var(--dash-link)] bg-[var(--dash-soft)]' : 'border-[var(--dash-border)] hover:bg-[var(--dash-soft)]'}`}
                      >
                        <span className="flex items-center gap-2 text-[13px] font-bold text-[var(--dash-text)]">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-lg"
                            style={tone(on ? 'violet' : 'slate')}
                          >
                            <Icon name={o.icon} size={15} />
                          </span>
                          {o.title}
                        </span>
                        <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                          {o.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              {editing && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[var(--dash-text2)]">
                    {t('pl.baseList')}
                  </span>
                  <select
                    value={parentListId}
                    onChange={(event) => setParentListId(event.target.value)}
                    className={inputCls}
                  >
                    <option value="">{t('pl.independentList')}</option>
                    {lists
                      .filter(
                        (candidate) =>
                          candidate.id !== list?.id && !candidate.parentListId
                      )
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name}
                        </option>
                      ))}
                  </select>
                  <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                    {t('pl.baseListDescription')}
                  </span>
                </label>
              )}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[var(--dash-text2)]">
                  {t('pl.slug')}
                </span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder={t('pl.slugPlaceholder')}
                  className={inputCls}
                />
              </label>
              <ToggleRow
                label={t('pl.publish')}
                desc={t('pl.publishDesc')}
                value={published}
                onToggle={() => setPublished((v) => !v)}
              />
              <ToggleRow
                label={t('pl.makeMain')}
                desc={t('pl.makeMainDesc')}
                value={principal}
                onToggle={() => setPrincipal((v) => !v)}
              />
              <ToggleRow
                label={t('list.viewerCapture')}
                desc={t('list.viewerCaptureDesc')}
                value={captureViewerInfo}
                onToggle={() => setCaptureViewerInfo((v) => !v)}
              />

              {/* Appearance overrides, collapsed by default so creating a list
                  stays a two-field job. */}
              <button
                type="button"
                onClick={() => setShowAppearance((v) => !v)}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] p-3.5 text-left hover:bg-[var(--dash-soft)]"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-[var(--dash-text)]">
                    {t('list.appearance.title')}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                    {hasOwnAppearance(appearance)
                      ? t('list.appearance.custom')
                      : t('list.appearance.inherit')}
                  </span>
                </span>
                <Icon
                  name="chevron-down"
                  size={16}
                  className={`shrink-0 text-[var(--dash-muted)] transition-transform ${showAppearance ? 'rotate-180' : ''}`}
                />
              </button>

              {showAppearance && (
                <div className="flex flex-col gap-4">
                  <p className="text-[11px] font-medium text-[var(--dash-muted)]">
                    {t('list.appearance.subtitle')}
                  </p>
                  <ListAppearanceFields
                    t={t}
                    value={appearance}
                    onChange={(patch) =>
                      setAppearance((a) => ({ ...a, ...patch }))
                    }
                    accent={tenant?.brandColor ?? '#7C3AED'}
                    inherited={{
                      design: tenant?.listDesign ?? 'store',
                      heroColor: tenant?.listHeroColor ?? null,
                      bgUrl: tenant?.listBgUrl ?? null,
                      bgOverlay: tenant?.listBgOverlay ?? false,
                    }}
                  />
                </div>
              )}

              {editing && (
                <>
                  {!initialCustomize && (
                    <button
                      type="button"
                      onClick={() => setShowTemplateContent((value) => !value)}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] p-3.5 text-left hover:bg-[var(--dash-soft)]"
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-bold text-[var(--dash-text)]">
                          Contenido y tipografía
                        </span>
                        <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                          Textos, imagen y detalles de esta plantilla.
                        </span>
                      </span>
                      <Icon
                        name="chevron-down"
                        size={16}
                        className={`shrink-0 text-[var(--dash-muted)] transition-transform ${showTemplateContent ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}

                  {showTemplateContent && (
                    <div
                      className={`flex flex-col gap-4 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-4 ${initialCustomize ? 'order-first' : ''}`}
                    >
                      {initialCustomize && (
                        <div className="flex items-start justify-between gap-3 border-b border-[var(--dash-border)] pb-4">
                          <div>
                            <p className="text-sm font-bold text-[var(--dash-text)]">
                              Personalizar plantilla
                            </p>
                            <p className="mt-0.5 text-xs font-medium text-[var(--dash-muted)]">
                              Cambios solo para esta lista.
                            </p>
                          </div>
                          <span className="rounded-lg bg-[var(--dash-surface)] px-2 py-1 text-[10px] font-bold text-[var(--dash-link)]">
                            {supportsEditorialContent ? 'EDITORIAL' : 'LISTA'}
                          </span>
                        </div>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <DashField label="Antetítulo">
                          <input
                            value={activeTemplateContent.hero?.eyebrow ?? ''}
                            onChange={(event) =>
                              updateTemplateHero('eyebrow', event.target.value)
                            }
                            className={inputCls}
                            placeholder="NOVEDADES"
                          />
                        </DashField>
                        <DashField label="Título">
                          <input
                            value={activeTemplateContent.hero?.title ?? ''}
                            onChange={(event) =>
                              updateTemplateHero('title', event.target.value)
                            }
                            className={inputCls}
                            placeholder={list?.name}
                          />
                        </DashField>
                        <DashField label="Descripción" wide>
                          <textarea
                            value={activeTemplateContent.hero?.body ?? ''}
                            onChange={(event) =>
                              updateTemplateHero('body', event.target.value)
                            }
                            className={`${inputCls} h-20 py-3`}
                            placeholder="Una breve introducción a la lista."
                          />
                        </DashField>
                        <DashField label="Tipografía">
                          <select
                            value={
                              activeTemplateContent.template?.font ?? 'sans'
                            }
                            onChange={(event) =>
                              updateTemplateField('font', event.target.value)
                            }
                            className={inputCls}
                          >
                            <option value="sans">Sans · moderna</option>
                            <option value="editorial">Editorial · serif</option>
                            <option value="serif">Serif · clásica</option>
                            <option value="mono">Mono · técnica</option>
                            <option value="code-pro">Code Pro</option>
                          </select>
                        </DashField>
                      </div>

                      {supportsEditorialContent && (
                        <div className="grid gap-3 border-t border-[var(--dash-border)] pt-4 sm:grid-cols-2">
                          <DashField label="Imagen editorial" wide>
                            <div className="flex flex-wrap gap-2">
                              <input
                                value={
                                  activeTemplateContent.template?.image ?? ''
                                }
                                onChange={(event) =>
                                  updateTemplateField(
                                    'image',
                                    event.target.value
                                  )
                                }
                                className={`${inputCls} min-w-0 flex-1`}
                                placeholder="https://…"
                              />
                              <label className="flex h-11 cursor-pointer items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-link)] hover:bg-white">
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp,image/gif"
                                  className="sr-only"
                                  onChange={(event) =>
                                    void uploadTemplateImage(event)
                                  }
                                />
                                Subir
                              </label>
                            </div>
                          </DashField>
                          {activeTemplateContent.template?.image && (
                            <img
                              src={activeTemplateContent.template.image}
                              alt="Vista previa"
                              className="h-32 w-full rounded-xl object-cover sm:col-span-2"
                            />
                          )}
                          <DashField label="Etiqueta de imagen">
                            <input
                              value={
                                activeTemplateContent.template?.imageLabel ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'imageLabel',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Título de imagen">
                            <input
                              value={
                                activeTemplateContent.template?.imageTitle ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'imageTitle',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Antetítulo de promoción">
                            <input
                              value={
                                activeTemplateContent.template?.promoEyebrow ??
                                ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'promoEyebrow',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Título de promoción">
                            <input
                              value={
                                activeTemplateContent.template?.promoTitle ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'promoTitle',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Texto de promoción" wide>
                            <textarea
                              value={
                                activeTemplateContent.template?.promoBody ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'promoBody',
                                  event.target.value
                                )
                              }
                              className={`${inputCls} h-20 py-3`}
                            />
                          </DashField>
                          <DashField label="Precio o llamada">
                            <input
                              value={
                                activeTemplateContent.template?.promoPrice ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'promoPrice',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Nota de promoción">
                            <input
                              value={
                                activeTemplateContent.template?.promoNote ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'promoNote',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Pie izquierdo">
                            <input
                              value={
                                activeTemplateContent.template?.footerLeft ?? ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'footerLeft',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                          <DashField label="Pie derecho">
                            <input
                              value={
                                activeTemplateContent.template?.footerRight ??
                                ''
                              }
                              onChange={(event) =>
                                updateTemplateField(
                                  'footerRight',
                                  event.target.value
                                )
                              }
                              className={inputCls}
                            />
                          </DashField>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => void saveTemplateContent()}
                          disabled={savingTemplateContent || !versionId.current}
                          className={`flex h-10 items-center rounded-xl px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${gradient}`}
                        >
                          {savingTemplateContent
                            ? 'Guardando…'
                            : 'Guardar contenido'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
              >
                {t('pl.cancel')}
              </button>
              <button
                type={initialCustomize ? 'button' : 'submit'}
                onClick={initialCustomize ? onClose : undefined}
                className={`flex h-11 items-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white ${gradient}`}
              >
                {initialCustomize ? (
                  'Listo'
                ) : (
                  <>
                    {t('pl.next')} <Icon name="chevron-right" size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <PriceListProductStep
            products={products}
            filteredProducts={filteredProducts}
            selected={selected}
            allShown={allShown}
            prodSearch={prodSearch}
            setProdSearch={setProdSearch}
            tenantLanguage={tenant?.language}
            t={t}
            toggleAll={toggleAll}
            toggleSel={toggleSel}
            onCreateProduct={() => setShowProductModal(true)}
            changeStep={changeStep}
            finalize={finalize}
            saving={saving}
            editing={editing}
          />
        )}
      </div>
      {showProductModal && (
        <ProductModal
          product={null}
          tenantId={tenantId}
          lists={lists}
          onCreated={(product) =>
            setSelected((current) => new Set(current).add(product.id))
          }
          onClose={() => setShowProductModal(false)}
        />
      )}
    </div>
  )
}
