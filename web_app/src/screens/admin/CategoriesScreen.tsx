import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import { fetchProducts, selectProducts } from '../../store/slices/productsSlice'
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  selectCategories,
  selectCategoriesLoading,
  selectCategoriesSaving,
  type CategoryInput,
} from '../../store/slices/categoriesSlice'
import type { Category } from '../../types'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { tone, gradient, type Tone } from './crm/theme'
import { catTone, catIcon, normalizeCategory } from './crm/productFormat'

const COLOR_OPTIONS: Tone[] = ['violet', 'sky', 'blue', 'green', 'amber', 'rose', 'purple', 'slate']

const catColor = (c: Category): Tone => (COLOR_OPTIONS.includes(c.color as Tone) ? (c.color as Tone) : catTone(c.name))

/* ── Screen ──────────────────────────────────────────────────────── */
export function CategoriesScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const tenant = useAppSelector(selectTenant)
  const categories = useAppSelector(selectCategories)
  const loading = useAppSelector(selectCategoriesLoading)
  const products = useAppSelector(selectProducts)

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null })

  useEffect(() => {
    if (tenant?.id) {
      dispatch(fetchCategories(tenant.id))
      dispatch(fetchProducts(tenant.id))
    }
  }, [dispatch, tenant?.id])

  // Product count per category name (case-insensitive).
  const countByCat = useMemo(() => {
    const m = new Map<string, number>()
    let withCat = 0
    for (const p of products) {
      const c = p.category?.trim().toLowerCase()
      if (c) { m.set(c, (m.get(c) ?? 0) + 1); withCat++ }
    }
    return { m, withCat, without: products.length - withCat }
  }, [products])

  const countFor = (c: Category) => countByCat.m.get(c.name.trim().toLowerCase()) ?? 0

  const topCategory = useMemo(() => {
    let best: Category | null = null
    let bestN = -1
    for (const c of categories) {
      const n = countFor(c)
      if (n > bestN) { best = c; bestN = n }
    }
    return best
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, countByCat])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => [c.name, c.description].some((v) => v?.toLowerCase().includes(q)))
  }, [categories, search])

  const handleDelete = (c: Category) => {
    const n = countFor(c)
    const extra = n > 0 ? ` Sus ${n} producto${n === 1 ? '' : 's'} quedarán sin categoría.` : ''
    if (window.confirm(`¿Eliminar la categoría “${c.name}”?${extra}`)) {
      dispatch(deleteCategory(c.id))
    }
  }

  const kpis: { icon: IconName; iconTone: Tone; value: string | number; label: string; note: string }[] = [
    { icon: 'tags', iconTone: 'violet', value: categories.length, label: 'Total categorías', note: 'En tu catálogo' },
    { icon: 'package', iconTone: 'sky', value: countByCat.withCat, label: 'Productos asignados', note: 'Con categoría' },
    { icon: 'alert-triangle', iconTone: 'amber', value: countByCat.without, label: 'Sin categoría', note: 'Requieren orden' },
    { icon: 'circle-check', iconTone: 'rose', value: topCategory ? topCategory.name : '—', label: 'Más usada', note: 'Top del catálogo' },
  ]

  return (
    <CrmLayout
      active="Categorías"
      title="Categorías"
      subtitle="Organizá tu catálogo en grupos."
      searchPlaceholder="Buscar categorías…"
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="flex min-w-[900px] flex-col gap-5 p-8">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="flex items-center gap-3.5 rounded-[18px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-[18px] shadow-[0_12px_30px_-12px_rgba(30,27,75,0.1)]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]" style={tone(k.iconTone)}>
                <Icon name={k.icon} size={22} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-end gap-2">
                  <span className="truncate text-[22px] font-black leading-none text-[var(--dash-text)]">{k.value}</span>
                  <span className="truncate pb-0.5 text-xs font-semibold text-[var(--dash-text2)]">{k.label}</span>
                </div>
                <span className="mt-1 truncate text-[11px] font-medium text-[var(--dash-muted)]">{k.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">Mis categorías</h3>
            <p className="text-xs font-medium text-[var(--dash-muted)]">Organizá los productos en grupos para que tus clientes los encuentren más rápido.</p>
          </div>
          <button
            type="button"
            onClick={() => setModal({ open: true, category: null })}
            className={`flex h-9 items-center gap-2 rounded-full px-4 text-xs font-bold text-white shadow-[0_8px_18px_-6px_rgba(124,58,237,0.5)] ${gradient}`}
          >
            <Icon name="plus" size={15} /> Nueva categoría
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">Cargando categorías…</div>
        ) : filtered.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={tone('violet')}><Icon name="tags" size={24} /></span>
            <p className="text-sm font-semibold text-[var(--dash-text)]">{categories.length > 0 ? 'Sin resultados' : 'Todavía no tenés categorías'}</p>
            {categories.length === 0 && (
              <button type="button" onClick={() => setModal({ open: true, category: null })} className={`flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white ${gradient}`}>
                <Icon name="plus" size={16} /> Crear la primera
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((c) => {
              const t = catColor(c)
              const n = countFor(c)
              return (
                <div key={c.id} className="flex flex-col gap-3.5 rounded-[20px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[0_18px_50px_-22px_rgba(30,27,75,0.2)]">
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={tone(t)}><Icon name={catIcon(c.name)} size={22} /></span>
                    <CardMenu onEdit={() => setModal({ open: true, category: c })} onDelete={() => handleDelete(c)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-[18px] font-extrabold text-[var(--dash-text)]">{c.name}</h4>
                    <p className="line-clamp-1 text-xs font-medium text-[var(--dash-muted)]">{c.description || 'Sin descripción'}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(t)}>{n} producto{n === 1 ? '' : 's'}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/items?cat=${encodeURIComponent(c.name)}`)}
                      className="flex items-center gap-1 text-xs font-bold text-[var(--dash-link)] hover:underline"
                    >
                      ver <Icon name="chevron-right" size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal.open && (
        <CategoryModal key={modal.category?.id ?? 'new'} category={modal.category} tenantId={tenant?.id} onClose={() => setModal({ open: false, category: null })} />
      )}
    </CrmLayout>
  )
}

/* ── Card actions menu (portal) ──────────────────────────────────── */
function CardMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggle = () => {
    if (open) { setOpen(false); return }
    const r = btnRef.current!.getBoundingClientRect()
    const top = r.bottom + 6 + 96 > window.innerHeight ? r.top - 96 - 6 : r.bottom + 6
    setPos({ top, left: Math.max(8, r.right - 160) })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node) || menuRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const close = () => setOpen(false)
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  return (
    <>
      <button ref={btnRef} type="button" onClick={toggle} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80">
        <Icon name="ellipsis" size={14} />
      </button>
      {open && createPortal(
        <div ref={menuRef} style={{ top: pos.top, left: pos.left, width: 160 }} className="dash fixed z-[120] rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1.5 font-sans shadow-[0_16px_44px_-12px_rgba(15,23,42,0.35)] animate-scale-in">
          <button type="button" onClick={() => { setOpen(false); onEdit() }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">
            <Icon name="settings" size={15} /> Editar
          </button>
          <button type="button" onClick={() => { setOpen(false); onDelete() }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[#EF4444] hover:bg-[var(--dash-soft)]">
            <Icon name="circle-x" size={15} /> Eliminar
          </button>
        </div>,
        document.body
      )}
    </>
  )
}

/* ── Create / edit modal ─────────────────────────────────────────── */
function CategoryModal({ category, tenantId, onClose }: { category: Category | null; tenantId?: string; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const saving = useAppSelector(selectCategoriesSaving)
  const [name, setName] = useState(category?.name ?? '')
  const [description, setDescription] = useState(category?.description ?? '')
  const [color, setColor] = useState<Tone>(catColor(category ?? ({ name: '', color: null } as Category)))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = normalizeCategory(name)
    if (!cleanName) return
    const data: CategoryInput = { name: cleanName, description: description.trim() || null, color }
    const result = category
      ? await dispatch(updateCategory({ categoryId: category.id, data }))
      : tenantId
        ? await dispatch(createCategory({ tenantId, data }))
        : null
    if (result && (createCategory.fulfilled.match(result) || updateCategory.fulfilled.match(result))) onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1B4B]/60 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form onSubmit={submit} className="dash w-full max-w-[440px] animate-scale-in rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 font-sans shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)]">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[var(--dash-text)]">{category ? 'Editar categoría' : 'Nueva categoría'}</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--dash-soft)] text-[var(--dash-text2)] hover:opacity-80">✕</button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={tone(color)}><Icon name={catIcon(name)} size={26} /></span>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-xs font-bold text-[var(--dash-text2)]">Nombre</span>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ferretería" className={inputCls} required />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--dash-text2)]">Descripción</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tornillos, bisagras y herrajes." className={inputCls} />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--dash-text2)]">Color</span>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className={`h-8 w-8 rounded-lg transition ${color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--dash-surface)] ring-[var(--dash-link)]' : ''}`}
                  style={{ backgroundColor: `var(--tone-${c}-bg)`, color: `var(--tone-${c}-fg)` }}
                >
                  <span className="mx-auto block h-3 w-3 rounded-full bg-current" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="flex h-11 items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">Cancelar</button>
          <button type="submit" disabled={saving} className={`flex h-11 items-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}>
            {saving ? 'Guardando…' : category ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls = 'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)]'

export default CategoriesScreen
