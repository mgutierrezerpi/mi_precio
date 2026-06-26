import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchLists, createList, deleteList, updateList, selectLists, selectIsLoading } from '../../store/slices/menuSlice'
import { selectCanEdit, selectTenant } from '../../store/slices/authSlice'
import type { ListKind, PriceList } from '../../types'

const emptyForm = { name: '', kind: 'product' as ListKind }

export function CompactListsScreen() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const lists = useAppSelector(selectLists)
  const isLoading = useAppSelector(selectIsLoading)
  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const showForm = searchParams.get('new') === '1'

  useEffect(() => {
    if (tenant?.id) dispatch(fetchLists(tenant.id))
  }, [dispatch, tenant?.id])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return lists
    return lists.filter((list) => [list.name, list.slug, list.kind].some((value) => value?.toLowerCase().includes(q)))
  }, [lists, query])

  const openNew = () => {
    setForm(emptyForm)
    setError(null)
    setSearchParams({ new: '1' })
  }

  const closeForm = () => {
    setForm(emptyForm)
    setError(null)
    setSearchParams({})
  }

  const handleCreateList = async () => {
    if (!tenant?.id || !canEdit) return
    const name = form.name.trim()
    if (!name) return setError('Ponele un nombre a la lista.')
    setCreating(true)
    setError(null)
    const action = await dispatch(createList({ tenantId: tenant.id, name, kind: form.kind }))
    setCreating(false)
    if (action.meta.requestStatus === 'fulfilled') closeForm()
    else setError('No se pudo crear la lista.')
  }

  const handleDelete = async (list: PriceList) => {
    if (!canEdit || !confirm(`¿Eliminar ${list.name}?`)) return
    await dispatch(deleteList(list.id))
  }

  const handleTogglePublished = async (list: PriceList) => {
    if (!canEdit) return
    await dispatch(updateList({ listId: list.id, data: { published: !list.published } }))
  }

  const publicUrl = (list: PriceList) => {
    if (!tenant?.subdomain) return null
    return `/p/${tenant.subdomain}/${list.slug || list.id}`
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--dash-muted)]">Catálogo</p>
          <h1 className="mt-1 text-3xl font-semibold text-[var(--dash-text)]">Listas compactas</h1>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">Publicá catálogos simples para compartir por link o QR.</p>
        </div>
        {canEdit && (
          <button type="button" onClick={openNew} className="rounded-xl bg-[linear-gradient(45deg,#7C3AED_0%,#A855F7_100%)] px-5 py-3 font-semibold text-white shadow-[0_10px_24px_-8px_rgba(124,58,237,0.5)] hover:opacity-90">
            Nueva lista
          </button>
        )}
      </div>

      <section className="grid gap-3 rounded-2xl border-2 border-[var(--simple-border)] bg-[var(--simple-surface)] p-4 shadow-[var(--simple-shadow)] sm:grid-cols-3">
        <Stat label="Total" value={lists.length} />
        <Stat label="Públicas" value={lists.filter((list) => list.published).length} />
        <Stat label="Productos" value={lists.reduce((sum, list) => sum + (list.itemCount || 0), 0)} />
      </section>

      {showForm && (
        <section className="rounded-2xl border-2 border-[var(--simple-border)] bg-[var(--simple-surface)] p-5 shadow-[var(--simple-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--dash-text)]">Nueva lista</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px]">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--dash-muted)]">
              Nombre
              <input
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                className="rounded-xl border-2 border-[var(--simple-border)] bg-[var(--dash-soft)] px-3 py-3 text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]"
                placeholder="Lista principal"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--dash-muted)]">
              Tipo
              <select
                value={form.kind}
                onChange={(e) => setForm((current) => ({ ...current, kind: e.target.value as ListKind }))}
                className="rounded-xl border-2 border-[var(--simple-border)] bg-[var(--dash-soft)] px-3 py-3 text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]"
              >
                <option value="product">Productos</option>
                <option value="service">Servicios</option>
              </select>
            </label>
          </div>
          {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={handleCreateList} disabled={creating} className="rounded-xl bg-[linear-gradient(45deg,#7C3AED_0%,#A855F7_100%)] px-5 py-3 font-semibold text-white disabled:opacity-60">
              {creating ? 'Creando...' : 'Crear'}
            </button>
            <button type="button" onClick={closeForm} className="rounded-xl border-2 border-[var(--simple-border)] px-5 py-3 font-semibold text-[var(--dash-text2)]">
              Cancelar
            </button>
          </div>
        </section>
      )}

      <label className="block">
        <span className="sr-only">Buscar</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar lista..." className="w-full rounded-xl border-2 border-[var(--simple-border)] bg-[var(--simple-surface)] px-4 py-3 text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]" />
      </label>

      <section className="overflow-hidden rounded-2xl border-2 border-[var(--simple-border)] bg-[var(--simple-surface)] shadow-[var(--simple-shadow)]">
        {isLoading && lists.length === 0 ? (
          <p className="p-8 text-center text-sm text-[var(--dash-muted)]">Cargando...</p>
        ) : shown.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-[var(--dash-text)]">{lists.length === 0 ? 'Todavía no tenés listas.' : 'No hay resultados.'}</p>
            {lists.length === 0 && canEdit && (
              <button type="button" onClick={openNew} className="mt-4 rounded-xl bg-[linear-gradient(45deg,#7C3AED_0%,#A855F7_100%)] px-5 py-3 font-semibold text-white">
                Crear primera lista
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--dash-divider)]">
            {shown.map((list, index) => (
              <article key={list.id} className="grid gap-4 p-4 sm:grid-cols-[56px_1fr_auto] sm:items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tone-violet-bg)] text-base font-black text-[var(--dash-link)]">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/admin/lists/${list.id}`} className="truncate text-xl font-semibold text-[var(--dash-text)] hover:text-[var(--dash-link)]">
                      {list.name}
                    </Link>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${list.published ? 'bg-[var(--tone-green-bg)] text-[var(--tone-green-fg)]' : 'bg-[var(--tone-amber-bg)] text-[var(--tone-amber-fg)]'}`}>
                      {list.published ? 'Pública' : 'Borrador'}
                    </span>
                    {list.showOnIndex && <span className="rounded-full bg-[var(--dash-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--dash-muted)]">Principal</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--dash-muted)]">
                    <span>{list.itemCount || 0} producto{list.itemCount === 1 ? '' : 's'}</span>
                    <span>{list.kind === 'service' ? 'Servicios' : 'Productos'}</span>
                    <span>Actualizada {formatDate(list.updatedAt)}</span>
                    {list.slug && <span>/{list.slug}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {publicUrl(list) && (
                    <Link to={publicUrl(list)!} className="rounded-lg border-2 border-[var(--simple-border)] px-3 py-2 text-sm font-medium text-[var(--dash-text2)]">
                      Ver
                    </Link>
                  )}
                  {canEdit && (
                    <>
                      <button type="button" onClick={() => handleTogglePublished(list)} className="rounded-lg border-2 border-[var(--simple-border)] px-3 py-2 text-sm font-medium text-[var(--dash-text2)]">
                        {list.published ? 'Ocultar' : 'Publicar'}
                      </button>
                      <Link to={`/admin/lists/${list.id}`} className="rounded-lg border-2 border-[var(--simple-border)] px-3 py-2 text-sm font-medium text-[var(--dash-text2)]">
                        Editar
                      </Link>
                      <button type="button" onClick={() => handleDelete(list)} className="rounded-lg border-2 border-[var(--simple-border)] px-3 py-2 text-sm font-medium text-[var(--tone-red-fg)]">
                        Borrar
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[var(--dash-soft)] px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--dash-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--dash-text)]">{value}</p>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-UY', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default CompactListsScreen
