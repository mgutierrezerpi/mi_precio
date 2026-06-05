import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectTenant, selectCanEdit } from '../../store/slices/authSlice'
import type { Customer, CustomerStats, Order, Product } from '../../types'
import api from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { tone, gradient, type Tone } from './crm/theme'

type Status = 'Activo' | 'Inactivo' | 'Nuevo'
const statusTone: Record<Status, Tone> = { Activo: 'green', Inactivo: 'slate', Nuevo: 'violet' }

const TONE_POOL: Tone[] = ['violet', 'sky', 'blue', 'green', 'amber', 'rose', 'purple']
function avatarTone(name: string): Tone {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return TONE_POOL[h % TONE_POOL.length]
}
const initials = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'

// Backend stores naive UTC; tag as UTC so the browser converts to the right local time.
function parseUtc(iso?: string | null): Date | null {
  if (!iso) return null
  const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso)
  const d = new Date(hasTz ? iso : `${iso}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}
function relativeTime(iso?: string | null): string {
  const d = parseUtc(iso)
  if (!d) return 'Sin compras'
  const s = (Date.now() - d.getTime()) / 1000
  if (s < 60) return 'Recién'
  if (s < 3600) return `Hace ${Math.floor(s / 60)} min`
  if (s < 86400) return `Hace ${Math.floor(s / 3600)} h`
  const days = Math.floor(s / 86400)
  if (days < 2) return 'Ayer'
  if (days < 30) return `Hace ${days} días`
  if (days < 60) return 'Hace 1 mes'
  return `Hace ${Math.floor(days / 30)} meses`
}
function fullDate(iso?: string | null): string {
  const d = parseUtc(iso)
  return d ? d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

function statusOf(c: Customer): Status {
  if (c.ordersCount === 0) return 'Nuevo'
  const last = parseUtc(c.lastOrderAt)
  if (last && (Date.now() - last.getTime()) / 86400000 <= 30) return 'Activo'
  return 'Inactivo'
}

export function CustomersScreen() {
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const currency = tenant?.currency || 'UYU'
  const money = useCallback(
    (v: string | number) => `${currency} ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(typeof v === 'number' ? v : parseFloat(v) || 0)}`,
    [currency],
  )

  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()
  const [showNew, setShowNew] = useState(() => searchParams.get('new') === '1' && canEdit)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const tenantId = tenant?.id
  const refresh = useCallback(async () => {
    if (!tenantId) return
    const [cs, st] = await Promise.all([api.getCustomers(tenantId), api.getCustomerStats(tenantId)])
    if (cs.data) setCustomers(cs.data)
    if (st.data) setStats(st.data)
    setLoading(false)
  }, [tenantId])

  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    Promise.all([api.getCustomers(tenantId), api.getCustomerStats(tenantId), api.getProducts(tenantId)]).then(([cs, st, ps]) => {
      if (cancelled) return
      if (cs.data) setCustomers(cs.data)
      if (st.data) setStats(st.data)
      if (ps.data) setProducts(ps.data)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [tenantId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? customers.filter((c) => [c.name, c.email, c.phone].some((v) => v?.toLowerCase().includes(q))) : customers
  }, [customers, search])

  const removeCustomer = async (c: Customer) => {
    if (!confirm(`¿Eliminar a ${c.name} y todo su historial?`)) return
    await api.deleteCustomer(c.id)
    if (openId === c.id) setOpenId(null)
    await refresh()
  }

  const kpis: { icon: IconName; iconTone: Tone; value: number; label: string; note: string }[] = [
    { icon: 'users', iconTone: 'violet', value: stats?.total ?? 0, label: 'Total clientes', note: 'En tu cartera' },
    { icon: 'circle-check', iconTone: 'green', value: stats?.active ?? 0, label: 'Activos', note: 'Compraron este mes' },
    { icon: 'user-plus', iconTone: 'sky', value: stats?.new ?? 0, label: 'Nuevos', note: 'Últimos 30 días' },
    { icon: 'trending-up', iconTone: 'rose', value: stats?.recurring ?? 0, label: 'Recurrentes', note: '3+ compras' },
  ]

  return (
    <CrmLayout active="Clientes" title="Clientes" subtitle="Gestioná tu cartera de clientes." searchPlaceholder="Buscar clientes…" searchValue={search} onSearchChange={setSearch}>
      <div className="flex min-w-[980px] flex-col gap-5 p-8">
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="flex items-center gap-3.5 rounded-[18px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-[18px] shadow-[0_12px_30px_-12px_rgba(30,27,75,0.1)]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]" style={tone(k.iconTone)}><Icon name={k.icon} size={22} /></span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-end gap-2"><span className="text-[26px] font-black leading-none text-[var(--dash-text)]">{k.value}</span><span className="truncate pb-0.5 text-xs font-semibold text-[var(--dash-text2)]">{k.label}</span></div>
                <span className="mt-1 truncate text-[11px] font-medium text-[var(--dash-muted)]">{k.note}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-[18px] rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">Clientes</h3>
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={tone('violet')}>{customers.length} totales</span>
            </div>
            {canEdit && <button type="button" onClick={() => setShowNew(true)} className={`flex h-[38px] items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-4px_rgba(124,58,237,0.4)] ${gradient}`}><Icon name="plus" size={16} /> Nuevo cliente</button>}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--dash-border)]">
            <div className="flex items-center gap-3 bg-[var(--dash-table-head)] px-[18px] py-3.5 text-[11px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              <span className="flex-1">Cliente</span>
              <span className="w-[150px]">Teléfono</span>
              <span className="w-[120px]">Última compra</span>
              <span className="w-[110px]">Total</span>
              <span className="w-[90px]">Estado</span>
              <span className="w-[184px] text-right">Acciones</span>
            </div>

            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">Cargando…</div>
            ) : filtered.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm font-semibold text-[var(--dash-text)]">{customers.length === 0 ? 'Todavía no tenés clientes' : 'Sin resultados'}</p>
                {customers.length === 0 && canEdit && (
                  <button type="button" onClick={() => setShowNew(true)} className={`flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white ${gradient}`}><Icon name="plus" size={16} /> Agregar el primero</button>
                )}
              </div>
            ) : (
              filtered.map((c, i) => {
                const st = statusOf(c)
                return (
                  <div key={c.id} role="button" tabIndex={0} onClick={() => setOpenId(c.id)} onKeyDown={(e) => { if (e.key === 'Enter') setOpenId(c.id) }} className={`flex w-full cursor-pointer items-center gap-3 bg-[var(--dash-surface)] px-[18px] py-3 text-left hover:bg-[var(--dash-soft)] ${i > 0 ? 'border-t border-[var(--dash-divider)]' : ''}`}>
                    <div className="flex flex-1 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={tone(avatarTone(c.name))}>{initials(c.name)}</span>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{c.name}</span>
                        <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">{c.email || 'Sin email'}</span>
                      </div>
                    </div>
                    <span className="w-[150px] text-xs font-medium text-[var(--dash-text2)]">{c.phone || '—'}</span>
                    <span className="w-[120px] text-xs font-medium text-[var(--dash-muted)]">{relativeTime(c.lastOrderAt)}</span>
                    <span className="w-[110px] text-[13px] font-extrabold text-[var(--dash-text)]">{money(c.totalSpent)}</span>
                    <span className="w-[90px]"><span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(statusTone[st])}>{st}</span></span>
                    <div className="flex w-[184px] items-center justify-end gap-2">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setOpenId(c.id) }} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-bold" style={tone('violet')}>
                        <Icon name="eye" size={14} /> Ver
                      </button>
                      {canEdit && (
                        <>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setEditCustomer(c) }} title="Editar cliente" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] hover:text-[var(--dash-link)]">
                            <Icon name="pencil" size={15} />
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); void removeCustomer(c) }} title="Eliminar cliente" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--tone-red-bg)] hover:text-[var(--tone-red-fg)]">
                            <Icon name="circle-x" size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {showNew && tenant?.id && (
        <CustomerModal tenantId={tenant.id} onClose={() => setShowNew(false)} onSaved={(id) => { setShowNew(false); void refresh(); setOpenId(id) }} />
      )}
      {editCustomer && (
        <CustomerModal customer={editCustomer} onClose={() => setEditCustomer(null)} onSaved={() => { setEditCustomer(null); void refresh() }} />
      )}
      {openId && (
        <CustomerDrawer customerId={openId} products={products} money={money} canEdit={canEdit} onClose={() => setOpenId(null)} onChanged={refresh} />
      )}
    </CrmLayout>
  )
}

/* ── New customer modal ─────────────────────────────────────────────── */
function CustomerModal({ tenantId, customer, onClose, onSaved }: { tenantId?: string; customer?: Customer; onClose: () => void; onSaved: (id: string) => void }) {
  const isEdit = !!customer
  const [name, setName] = useState(customer?.name ?? '')
  const [rut, setRut] = useState(customer?.rut ?? '')
  const [email, setEmail] = useState(customer?.email ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? '')
  const [notes, setNotes] = useState(customer?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const valid = name.trim() !== '' && email.trim() !== '' && phone.trim() !== ''

  const save = async () => {
    if (!valid || saving) return
    setSaving(true)
    const body = { name: name.trim(), rut: rut.trim() || null, email: email.trim(), phone: phone.trim(), notes: notes.trim() || null }
    const res = isEdit ? await api.updateCustomer(customer.id, body) : await api.createCustomer(tenantId!, body)
    setSaving(false)
    if (res.data) onSaved(res.data.id)
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-[440px] rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-[var(--dash-text)]">{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h3>
        <div className="mt-4 flex flex-col gap-3">
          <Field label="Nombre cliente/empresa *"><input value={name} onChange={(e) => setName(e.target.value)} autoFocus className={inputCls} placeholder="Lucía Fernández" /></Field>
          <Field label="RUT (opcional)"><input value={rut} onChange={(e) => setRut(e.target.value)} className={inputCls} placeholder="21 123456 0017" /></Field>
          <Field label="Email *"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputCls} placeholder="lucia@correo.com" /></Field>
          <Field label="Teléfono *"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+598 99 123 456" /></Field>
          <Field label="Notas"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} placeholder="Preferencias, observaciones…" /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-xl px-4 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">Cancelar</button>
          <button type="button" onClick={save} disabled={!valid || saving} className={`h-10 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-50 ${gradient}`}>{saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cliente'}</button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Customer ficha (drawer with purchase history) ──────────────────── */
function CustomerDrawer({ customerId, products, money, canEdit, onClose, onChanged }: { customerId: string; products: Product[]; money: (v: string | number) => string; canEdit: boolean; onClose: () => void; onChanged: () => Promise<void> }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCustomer, setEditingCustomer] = useState(false)

  const load = useCallback(async () => {
    const res = await api.getCustomerDetail(customerId)
    if (res.data) { setCustomer(res.data.customer); setOrders(res.data.orders) }
    setLoading(false)
  }, [customerId])

  useEffect(() => {
    let cancelled = false
    api.getCustomerDetail(customerId).then((res) => {
      if (cancelled || !res.data) return
      setCustomer(res.data.customer)
      setOrders(res.data.orders)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [customerId])

  const reloadAll = async () => { await load(); await onChanged() }

  const removeCustomer = async () => {
    if (!confirm('¿Eliminar este cliente y todo su historial?')) return
    await api.deleteCustomer(customerId)
    await onChanged()
    onClose()
  }
  const removeOrder = async (orderId: string) => {
    await api.deleteOrder(orderId)
    await reloadAll()
  }

  const avgTicket = customer && customer.ordersCount > 0 ? parseFloat(customer.totalSpent) / customer.ordersCount : 0

  return (
    <Overlay onClose={onClose} align="right">
      <aside className="flex h-full w-[480px] flex-col border-l border-[var(--dash-border)] bg-[var(--dash-bg)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {loading || !customer ? (
          <div className="flex flex-1 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">Cargando ficha…</div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold" style={tone(avatarTone(customer.name))}>{initials(customer.name)}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3 className="truncate text-xl font-extrabold text-[var(--dash-text)]">{customer.name}</h3>
                <span className="w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={tone(statusTone[statusOf(customer)])}>{statusOf(customer)}</span>
              </div>
              <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"><Icon name="circle-x" size={20} /></button>
            </div>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
              {/* Contact */}
              <div className="flex flex-col gap-2.5 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
                {customer.rut && <ContactRow icon="file-spreadsheet" value={`RUT ${customer.rut}`} />}
                <ContactRow icon="user" value={customer.email || 'Sin email'} />
                <ContactRow icon="user-plus" value={customer.phone || 'Sin teléfono'} />
                {customer.notes && <p className="rounded-xl bg-[var(--dash-soft)] p-3 text-xs font-medium text-[var(--dash-text2)]">{customer.notes}</p>}
              </div>

              {/* Aggregates */}
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Compras" value={String(customer.ordersCount)} />
                <Stat label="Total gastado" value={money(customer.totalSpent)} />
                <Stat label="Última compra" value={fullDate(customer.lastOrderAt)} />
                <Stat label="Ticket promedio" value={money(avgTicket)} />
              </div>

              {/* Purchase history */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-[var(--dash-text)]">Historial de compras</h4>
                  {canEdit && (
                    <button type="button" onClick={() => { setEditingId(null); setAdding((v) => !v) }} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold" style={tone('violet')}>
                      <Icon name={adding ? 'circle-x' : 'plus'} size={14} /> {adding ? 'Cancelar' : 'Registrar compra'}
                    </button>
                  )}
                </div>

                {adding && canEdit && <OrderForm customerId={customerId} products={products} money={money} onSaved={async () => { setAdding(false); await reloadAll() }} />}

                {orders.length === 0 && !adding ? (
                  <div className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-[var(--dash-border)] py-10 text-center">
                    <Icon name="file-spreadsheet" size={22} className="text-[var(--dash-muted)]" />
                    <p className="text-sm font-semibold text-[var(--dash-text)]">Sin compras registradas</p>
                    <p className="text-xs font-medium text-[var(--dash-muted)]">Registrá la primera compra de este cliente.</p>
                  </div>
                ) : (
                  orders.map((o) => editingId === o.id
                    ? <OrderForm key={o.id} customerId={customerId} products={products} money={money} order={o} onCancel={() => setEditingId(null)} onSaved={async () => { setEditingId(null); await reloadAll() }} />
                    : <OrderCard key={o.id} order={o} money={money} canEdit={canEdit} onEdit={() => { setAdding(false); setEditingId(o.id) }} onDelete={() => removeOrder(o.id)} />)
                )}
              </div>
            </div>

            {canEdit && (
              <div className="flex gap-2 border-t border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
                <button type="button" onClick={() => setEditingCustomer(true)} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold" style={tone('violet')}>
                  <Icon name="pencil" size={16} /> Editar
                </button>
                <button type="button" onClick={removeCustomer} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold" style={tone('red')}>
                  <Icon name="circle-x" size={16} /> Eliminar
                </button>
              </div>
            )}
          </>
        )}
      </aside>

      {editingCustomer && customer && (
        <CustomerModal customer={customer} onClose={() => setEditingCustomer(false)} onSaved={async () => { setEditingCustomer(false); await reloadAll() }} />
      )}
    </Overlay>
  )
}

function OrderCard({ order, money, canEdit, onEdit, onDelete }: { order: Order; money: (v: string | number) => string; canEdit: boolean; onEdit: () => void; onDelete: () => void }) {
  const statusLabel: Record<string, { label: string; tone: Tone }> = {
    paid: { label: 'Pagada', tone: 'green' }, pending: { label: 'Pendiente', tone: 'amber' }, cancelled: { label: 'Cancelada', tone: 'slate' },
  }
  const s = statusLabel[order.status] || statusLabel.paid
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <div className="flex items-start justify-between">
        {order.reference
          ? <div className="flex items-center gap-1.5 text-[var(--dash-link)]"><Icon name="file-spreadsheet" size={15} /><span className="text-[17px] font-black leading-none">#{order.reference}</span></div>
          : <span />}
        {canEdit && (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={onEdit} title="Editar compra" className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] hover:text-[var(--dash-link)]"><Icon name="pencil" size={14} /></button>
            <button type="button" onClick={onDelete} title="Eliminar compra" className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] hover:text-[var(--tone-red-fg)]"><Icon name="circle-x" size={15} /></button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-[13px] font-bold text-[var(--dash-text)]">{fullDate(order.createdAt)}</span>
          <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={tone(s.tone)}>{s.label}</span>
        </div>
        <span className="text-[15px] font-extrabold text-[var(--dash-text)]">{money(order.total)}</span>
      </div>
      {order.items.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-[var(--dash-divider)] pt-2">
          {order.items.map((it) => (
            <div key={it.id} className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--dash-text2)]">{it.quantity}× {it.name}</span>
              <span className="font-semibold text-[var(--dash-muted)]">{money(parseFloat(it.unitPrice) * it.quantity)}</span>
            </div>
          ))}
        </div>
      )}
      {order.note && <p className="text-xs font-medium text-[var(--dash-muted)]">{order.note}</p>}
    </div>
  )
}

type Line = { name: string; quantity: string; unitPrice: string; custom: boolean }
const CUSTOM = '__custom__'
function OrderForm({ customerId, products, money, order, onSaved, onCancel }: { customerId: string; products: Product[]; money: (v: string | number) => string; order?: Order; onSaved: () => Promise<void>; onCancel?: () => void }) {
  const newLine = (): Line => ({ name: '', quantity: '1', unitPrice: '', custom: false })
  const initialLines = (): Line[] =>
    order && order.items.length
      ? order.items.map((it) => ({ name: it.name, quantity: String(it.quantity), unitPrice: it.unitPrice, custom: !products.some((p) => p.name === it.name) }))
      : [newLine()]
  const [lines, setLines] = useState<Line[]>(initialLines)
  const [reference, setReference] = useState(order?.reference ?? '')
  const [note, setNote] = useState(order?.note ?? '')
  const [status, setStatus] = useState(order?.status ?? 'paid')
  const [saving, setSaving] = useState(false)
  const isEdit = !!order

  const setLine = (i: number, patch: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  const addLine = () => setLines((ls) => [...ls, newLine()])
  const removeLine = (i: number) => setLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls))

  // Picking a catalog product fills the name + its price; "Otro" switches to free text.
  const pickProduct = (i: number, value: string) => {
    if (value === CUSTOM) { setLine(i, { custom: true, name: '', unitPrice: '' }); return }
    const p = products.find((pr) => pr.name === value)
    setLine(i, { custom: false, name: value, unitPrice: p ? p.price : '' })
  }

  const total = lines.reduce((sum, l) => sum + (parseFloat(l.unitPrice) || 0) * (parseInt(l.quantity) || 0), 0)
  const valid = lines.some((l) => l.name.trim() && parseFloat(l.unitPrice) > 0)

  const save = async () => {
    if (!valid || saving) return
    setSaving(true)
    const items = lines
      .filter((l) => l.name.trim() && parseFloat(l.unitPrice) > 0)
      .map((l) => ({ name: l.name.trim(), quantity: parseInt(l.quantity) || 1, unit_price: parseFloat(l.unitPrice) }))
    const payload = { items, status, note: note.trim() || null, reference: reference.trim() || null }
    if (order) await api.updateOrder(order.id, payload)
    else await api.createOrder(customerId, payload)
    setSaving(false)
    await onSaved()
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] p-4">
      <div className="flex items-center gap-2">
        <Icon name="file-spreadsheet" size={15} className="shrink-0 text-[var(--dash-muted)]" />
        <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="N° de pedido / factura (opcional)" className={`${inputCls} flex-1`} />
      </div>
      <div className="flex flex-col gap-2">
        {lines.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            {l.custom ? (
              <input value={l.name} onChange={(e) => setLine(i, { name: e.target.value })} placeholder="Producto / servicio" autoFocus className={`${inputCls} flex-1`} />
            ) : (
              <select value={l.name} onChange={(e) => pickProduct(i, e.target.value)} className={`${inputCls} flex-1 ${l.name ? '' : 'text-[var(--dash-muted)]'}`}>
                <option value="">Producto / servicio…</option>
                {products.map((p) => <option key={p.id} value={p.name} className="text-[var(--dash-text)]">{p.name}</option>)}
                <option value={CUSTOM} className="text-[var(--dash-text)]">Otro (personalizado)…</option>
              </select>
            )}
            <input value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value.replace(/\D/g, '') })} className={`${inputCls} w-14 text-center`} />
            <input value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: e.target.value.replace(/[^\d.]/g, '') })} placeholder="Precio" className={`${inputCls} w-24`} />
            {lines.length > 1
              ? <button type="button" onClick={() => removeLine(i)} title="Quitar línea" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-surface)]"><Icon name="circle-x" size={16} /></button>
              : <span className="h-9 w-9 shrink-0" />}
          </div>
        ))}
        <button type="button" onClick={addLine} className="flex w-fit items-center gap-1.5 text-xs font-bold text-[var(--dash-link)]"><Icon name="plus" size={14} /> Agregar línea</button>
      </div>
      <div className="flex items-center gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} w-32`}>
          <option value="paid">Pagada</option>
          <option value="pending">Pendiente</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota (opcional)" className={`${inputCls} flex-1`} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--dash-text)]">Total: {money(total)}</span>
        <div className="flex items-center gap-2">
          {onCancel && <button type="button" onClick={onCancel} className="h-9 rounded-xl px-3 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-surface)]">Cancelar</button>}
          <button type="button" onClick={save} disabled={!valid || saving} className={`h-9 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-50 ${gradient}`}>{saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Registrar'}</button>
        </div>
      </div>
    </div>
  )
}

/* ── Small shared pieces ────────────────────────────────────────────── */
const inputCls = 'rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2 text-sm font-medium text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-link)] focus:ring-0'

function Overlay({ children, onClose, align = 'center' }: { children: React.ReactNode; onClose: () => void; align?: 'center' | 'right' }) {
  return (
    <div onClick={(e) => { e.stopPropagation(); onClose() }} className={`fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm ${align === 'right' ? 'justify-end' : 'items-center justify-center'}`}>
      {children}
    </div>
  )
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">{label}</span>
      {children}
    </label>
  )
}
function ContactRow({ icon, value }: { icon: IconName; value: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--dash-text2)]">
      <Icon name={icon} size={15} className="text-[var(--dash-muted)]" /> {value}
    </div>
  )
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--dash-muted)]">{label}</span>
      <span className="text-[15px] font-extrabold text-[var(--dash-text)]">{value}</span>
    </div>
  )
}

export default CustomersScreen
