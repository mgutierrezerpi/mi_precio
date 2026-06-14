import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectCanEdit, selectTenant } from '../../store/slices/authSlice'
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  selectProducts,
  selectProductsLoading,
  selectProductsSaving,
  updateProduct,
  type ProductInput,
} from '../../store/slices/productsSlice'
import type { Product } from '../../types'

const emptyForm = { name: '', price: '', available: true }

export function SimpleProductsScreen() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const products = useAppSelector(selectProducts)
  const loading = useAppSelector(selectProductsLoading)
  const saving = useAppSelector(selectProductsSaving)
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const showForm = searchParams.get('new') === '1' || !!editing

  useEffect(() => {
    if (tenant?.id) dispatch(fetchProducts(tenant.id))
  }, [dispatch, tenant?.id])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? products.filter((p) => [p.name, p.sku, p.category].some((v) => v?.toLowerCase().includes(q))) : products
  }, [products, query])

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm)
    setError(null)
    setSearchParams({ new: '1' })
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({ name: product.name, price: String(Number(product.price) || ''), available: product.available })
    setError(null)
    setSearchParams({})
  }

  const closeForm = () => {
    setEditing(null)
    setForm(emptyForm)
    setError(null)
    setSearchParams({})
  }

  const submit = async () => {
    if (!tenant?.id || !canEdit) return
    const name = form.name.trim()
    const price = Number(form.price)
    if (!name) return setError('Poné un nombre.')
    if (!Number.isFinite(price) || price < 0) return setError('Poné un precio válido.')
    setError(null)
    const data: ProductInput = { name, price, available: form.available, currency: tenant.currency }
    const action = editing
      ? await dispatch(updateProduct({ productId: editing.id, data }))
      : await dispatch(createProduct({ tenantId: tenant.id, data }))
    if (action.meta.requestStatus === 'fulfilled') closeForm()
    else setError('No se pudo guardar.')
  }

  const remove = async (product: Product) => {
    if (!canEdit || !confirm(`¿Eliminar ${product.name}?`)) return
    await dispatch(deleteProduct(product.id))
  }

  const toggleAvailable = async (product: Product) => {
    if (!canEdit) return
    await dispatch(updateProduct({ productId: product.id, data: { available: !product.available } }))
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-[var(--dash-text)]">Productos</h1>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">Nombre, precio y si se ve o no en la lista.</p>
        </div>
        {canEdit && (
          <button type="button" onClick={openNew} className="rounded-xl bg-[linear-gradient(45deg,#7C3AED_0%,#A855F7_100%)] px-5 py-3 font-semibold text-white shadow-[0_10px_24px_-8px_rgba(124,58,237,0.5)] hover:opacity-90">
            Agregar producto
          </button>
        )}
      </div>

      {showForm && (
        <section className="rounded-2xl border-2 border-[var(--simple-border)] bg-[var(--simple-surface)] p-5 shadow-[var(--simple-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--dash-text)]">{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px_150px]">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--dash-muted)]">
              Nombre
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-xl border-2 border-[var(--simple-border)] bg-[var(--dash-soft)] px-3 py-3 text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]" autoFocus />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--dash-muted)]">
              Precio
              <input type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="rounded-xl border-2 border-[var(--simple-border)] bg-[var(--dash-soft)] px-3 py-3 text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--dash-muted)]">
              Estado
              <select value={form.available ? 'yes' : 'no'} onChange={(e) => setForm((f) => ({ ...f, available: e.target.value === 'yes' }))} className="rounded-xl border-2 border-[var(--simple-border)] bg-[var(--dash-soft)] px-3 py-3 text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]">
                <option value="yes">Visible</option>
                <option value="no">Oculto</option>
              </select>
            </label>
          </div>
          {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={submit} disabled={saving} className="rounded-xl bg-[linear-gradient(45deg,#7C3AED_0%,#A855F7_100%)] px-5 py-3 font-semibold text-white disabled:opacity-60">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={closeForm} className="rounded-xl border-2 border-[var(--simple-border)] px-5 py-3 font-semibold text-[var(--dash-text2)]">
              Cancelar
            </button>
          </div>
        </section>
      )}

      <label className="block">
        <span className="sr-only">Buscar</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto..." className="w-full rounded-xl border-2 border-[var(--simple-border)] bg-[var(--simple-surface)] px-4 py-3 text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]" />
      </label>

      <section className="overflow-hidden rounded-2xl border-2 border-[var(--simple-border)] bg-[var(--simple-surface)] shadow-[var(--simple-shadow)]">
        {loading && products.length === 0 ? (
          <p className="p-8 text-center text-sm text-[var(--dash-muted)]">Cargando...</p>
        ) : shown.length === 0 ? (
          <p className="p-8 text-center text-sm text-[var(--dash-muted)]">No hay productos.</p>
        ) : (
          <div className="divide-y divide-[var(--dash-divider)]">
            {shown.map((product) => (
              <div key={product.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[var(--dash-text)]">{product.name}</p>
                  <p className="text-sm text-[var(--dash-muted)]">{product.available ? 'Visible en lista' : 'Oculto'}</p>
                </div>
                <p className="text-lg font-semibold text-[var(--dash-link)]">{formatPrice(product.price, product.currency)}</p>
                {canEdit && (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => toggleAvailable(product)} className="rounded-lg border-2 border-[var(--simple-border)] px-3 py-2 text-sm font-medium text-[var(--dash-text2)]">
                      {product.available ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button type="button" onClick={() => openEdit(product)} className="rounded-lg border-2 border-[var(--simple-border)] px-3 py-2 text-sm font-medium text-[var(--dash-text2)]">
                      Editar
                    </button>
                    <button type="button" onClick={() => remove(product)} className="rounded-lg border-2 border-[var(--simple-border)] px-3 py-2 text-sm font-medium text-[var(--tone-red-fg)]">
                      Borrar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function formatPrice(price: string, currency: string) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(price) || 0)
}

export default SimpleProductsScreen
