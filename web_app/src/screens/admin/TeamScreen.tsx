import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectTenant, selectUser } from '../../store/slices/authSlice'
import api from '../../services/api'
import type { TeamMember, Invitation, MemberStats, Role } from '../../types'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { tone, gradient, type Tone } from './crm/theme'

/* ── Role metadata ───────────────────────────────────────────────────── */
const ROLE_LABEL: Record<Role, string> = { owner: 'Dueño', admin: 'Admin', editor: 'Editor', viewer: 'Lector' }
const ROLE_TONE: Record<Role, Tone> = { owner: 'violet', admin: 'sky', editor: 'green', viewer: 'slate' }
// Roles an owner/admin can assign (never "owner").
const ASSIGNABLE: Role[] = ['admin', 'editor', 'viewer']
const ROLE_PERMS: { role: Role; desc: string }[] = [
  { role: 'owner', desc: 'Control total de la cuenta, equipo y configuración.' },
  { role: 'admin', desc: 'Gestiona catálogo, clientes, equipo y ajustes.' },
  { role: 'editor', desc: 'Crea y edita productos, listas y clientes.' },
  { role: 'viewer', desc: 'Solo lectura del catálogo y los reportes.' },
]
const ACTIVE_WINDOW_DAYS = 14

const initials = (n: string) => n.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

function avatarTone(seed: string): Tone {
  const pool: Tone[] = ['violet', 'sky', 'blue', 'green', 'amber', 'rose', 'purple']
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return pool[h % pool.length]
}

// Backend timestamps are naive UTC; tag as UTC for correct relative time.
function lastSeen(iso: string | null): { label: string; active: boolean } {
  if (!iso) return { label: 'Sin ingresos', active: false }
  const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso)
  const ms = Date.now() - new Date(hasTz ? iso : `${iso}Z`).getTime()
  const active = ms < ACTIVE_WINDOW_DAYS * 86400_000
  const s = ms / 1000
  let label: string
  if (s < 60) label = 'Recién'
  else if (s < 3600) label = `hace ${Math.floor(s / 60)} min`
  else if (s < 86400) label = `hace ${Math.floor(s / 3600)} h`
  else { const d = Math.floor(s / 86400); label = d < 2 ? 'ayer' : `hace ${d} días` }
  return { label, active }
}

/* ── Screen ──────────────────────────────────────────────────────────── */
export function TeamScreen() {
  const tenant = useAppSelector(selectTenant)
  const me = useAppSelector(selectUser)
  const myRole: Role = me?.role ?? 'owner'
  const canManage = myRole === 'owner' || myRole === 'admin'

  const [members, setMembers] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<Invitation[]>([])
  const [stats, setStats] = useState<MemberStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const tenantId = tenant?.id
  const refresh = useCallback(async () => {
    if (!tenantId) return
    const [m, i, s] = await Promise.all([
      api.getMembers(tenantId),
      api.getInvitations(tenantId),
      api.getMemberStats(tenantId),
    ])
    if (m.data) setMembers(m.data)
    if (i.data) setInvites(i.data)
    if (s.data) setStats(s.data)
    setLoading(false)
  }, [tenantId])

  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    Promise.all([api.getMembers(tenantId), api.getInvitations(tenantId), api.getMemberStats(tenantId)]).then(([m, i, s]) => {
      if (cancelled) return
      if (m.data) setMembers(m.data)
      if (i.data) setInvites(i.data)
      if (s.data) setStats(s.data)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [tenantId])

  const kpis = useMemo(() => [
    { icon: 'users' as IconName, iconTone: 'violet' as Tone, value: stats?.members ?? 0, label: 'Miembros', note: 'En tu equipo' },
    { icon: 'circle-check' as IconName, iconTone: 'green' as Tone, value: stats?.active ?? 0, label: 'Activos', note: `Últimos ${ACTIVE_WINDOW_DAYS} días` },
    { icon: 'user-plus' as IconName, iconTone: 'amber' as Tone, value: stats?.pending ?? 0, label: 'Invitaciones', note: 'Pendientes' },
    { icon: 'settings' as IconName, iconTone: 'sky' as Tone, value: stats?.roles ?? 0, label: 'Roles', note: 'En uso' },
  ], [stats])

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? members.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)) : members
  }, [members, search])

  const changeRole = async (m: TeamMember, role: Role) => {
    if (!tenant?.id) return
    const res = await api.updateMemberRole(tenant.id, m.id, role)
    if (res.error) setError(res.error)
    else { setError(null); void refresh() }
  }

  const remove = async (m: TeamMember) => {
    if (!tenant?.id) return
    if (!confirm(`¿Quitar a ${m.name} del equipo? Perderá el acceso a la cuenta.`)) return
    const res = await api.removeMember(tenant.id, m.id)
    if (res.error) setError(res.error)
    else { setError(null); void refresh() }
  }

  const cancelInvite = async (inv: Invitation) => {
    if (!tenant?.id) return
    const res = await api.cancelInvitation(tenant.id, inv.id)
    if (res.error) setError(res.error)
    else { setError(null); void refresh() }
  }

  return (
    <CrmLayout active="Equipo" title="Equipo" subtitle="Gestioná quién accede a tu cuenta." searchPlaceholder="Buscar miembros…" searchValue={search} onSearchChange={setSearch}>
      <div className="flex min-w-[980px] flex-col gap-5 p-8">
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#B91C1C]">
            <span className="flex items-center gap-2"><Icon name="alert-triangle" size={16} /> {error}</span>
            <button type="button" onClick={() => setError(null)} className="text-xs font-bold hover:underline">Cerrar</button>
          </div>
        )}

        {/* KPIs */}
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

        {/* Members */}
        <div className="flex flex-col gap-[18px] rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
          <div className="flex items-center justify-between">
            <h3 className="text-[22px] font-extrabold text-[var(--dash-text)]">Miembros del equipo</h3>
            {canManage && (
              <button type="button" onClick={() => setShowInvite(true)} className={`flex h-[38px] items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-4px_rgba(124,58,237,0.4)] ${gradient}`}><Icon name="plus" size={16} /> Invitar miembro</button>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl border border-[var(--dash-border)]">
            <div className="flex items-center gap-3 bg-[var(--dash-table-head)] px-[18px] py-3.5 text-[11px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
              <span className="flex-1">Miembro</span>
              <span className="w-[150px]">Rol</span>
              <span className="w-[130px]">Último acceso</span>
              <span className="w-[90px]">Estado</span>
              {canManage && <span className="w-[70px] text-right">Acción</span>}
            </div>
            {loading ? (
              <div className="flex h-32 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">Cargando…</div>
            ) : shown.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm font-medium text-[var(--dash-muted)]">No se encontraron miembros.</div>
            ) : shown.map((m, idx) => {
              const isYou = me?.id === m.id
              const isOwner = m.role === 'owner'
              const editable = canManage && !isOwner && !isYou
              const seen = lastSeen(m.lastSeenAt)
              return (
                <div key={m.id} className={`flex items-center gap-3 bg-[var(--dash-surface)] px-[18px] py-3 ${idx > 0 ? 'border-t border-[var(--dash-divider)]' : ''}`}>
                  <div className="flex flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={tone(avatarTone(m.email))}>{initials(m.name || m.email)}</span>
                    <div className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-1.5 truncate text-[13px] font-bold text-[var(--dash-text)]">{m.name}{isYou && <span className="rounded-full bg-[var(--dash-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--dash-text2)]">Vos</span>}</span>
                      <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">{m.email}</span>
                    </div>
                  </div>
                  <span className="w-[150px]">
                    {editable ? (
                      <select value={m.role} onChange={(e) => changeRole(m, e.target.value as Role)} className="h-8 w-[120px] rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 text-[12px] font-bold text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]">
                        {ASSIGNABLE.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                    ) : (
                      <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(ROLE_TONE[m.role])}>{ROLE_LABEL[m.role]}</span>
                    )}
                  </span>
                  <span className="w-[130px] text-xs font-medium text-[var(--dash-muted)]">{seen.label}</span>
                  <span className="w-[90px]"><span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={tone(seen.active ? 'green' : 'slate')}>{seen.active ? 'Activo' : 'Inactivo'}</span></span>
                  {canManage && (
                    <span className="flex w-[70px] justify-end">
                      {!isOwner && !isYou && (
                        <button type="button" onClick={() => remove(m)} title="Quitar del equipo" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[#FEF2F2] hover:text-[#EF4444]"><Icon name="circle-x" size={16} /></button>
                      )}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom: permissions + pending invites */}
        <div className="flex gap-5">
          <div className="flex flex-1 flex-col gap-3.5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
            <h3 className="text-[18px] font-extrabold text-[var(--dash-text)]">Permisos por rol</h3>
            {ROLE_PERMS.map((r) => (
              <div key={r.role} className="flex items-center gap-3">
                <span className="w-[64px] shrink-0 rounded-full px-2.5 py-1 text-center text-[11px] font-bold" style={tone(ROLE_TONE[r.role])}>{ROLE_LABEL[r.role]}</span>
                <span className="text-[12px] font-medium text-[var(--dash-text2)]">{r.desc}</span>
              </div>
            ))}
          </div>
          <div className="flex w-[380px] shrink-0 flex-col gap-3.5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
            <h3 className="text-[18px] font-extrabold text-[var(--dash-text)]">Invitaciones pendientes</h3>
            {loading ? (
              <p className="py-4 text-center text-xs font-medium text-[var(--dash-muted)]">Cargando…</p>
            ) : invites.length === 0 ? (
              <p className="py-4 text-center text-xs font-medium text-[var(--dash-muted)]">No hay invitaciones pendientes.</p>
            ) : invites.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={tone('amber')}><Icon name="user-plus" size={16} /></span>
                <div className="flex min-w-0 flex-1 flex-col"><span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{inv.email}</span><span className="text-[11px] font-medium text-[var(--dash-muted)]">Rol: {ROLE_LABEL[inv.role]}</span></div>
                {canManage && <button type="button" onClick={() => cancelInvite(inv)} className="text-[12px] font-bold text-[#EF4444] hover:underline">Cancelar</button>}
              </div>
            ))}
            {canManage && (
              <p className="mt-1 text-[11px] font-medium leading-relaxed text-[var(--dash-muted)]">La invitación se activa cuando la persona inicia sesión con ese email por primera vez.</p>
            )}
          </div>
        </div>
      </div>

      {showInvite && tenant?.id && (
        <InviteModal tenantId={tenant.id} onClose={() => setShowInvite(false)} onInvited={() => { setShowInvite(false); void refresh() }} />
      )}
    </CrmLayout>
  )
}

/* ── Invite modal ────────────────────────────────────────────────────── */
function InviteModal({ tenantId, onClose, onInvited }: { tenantId: string; onClose: () => void; onInvited: () => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('editor')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const valid = /\S+@\S+\.\S+/.test(email.trim())

  const submit = async () => {
    if (!valid || saving) return
    setSaving(true)
    setErr(null)
    const res = await api.inviteMember(tenantId, email.trim(), role)
    setSaving(false)
    if (res.error) setErr(res.error)
    else onInvited()
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[440px] rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-[var(--dash-text)]">Invitar miembro</h3>
        <p className="mt-1 text-xs font-medium text-[var(--dash-muted)]">Se unirá a tu equipo al iniciar sesión con este email.</p>
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--dash-text2)]">Email *</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoFocus onKeyDown={(e) => e.key === 'Enter' && submit()} className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2 text-sm font-medium text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-link)]" placeholder="persona@correo.com" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--dash-text2)]">Rol</span>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2 text-sm font-medium text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)]">
              {ASSIGNABLE.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]} — {ROLE_PERMS.find((p) => p.role === r)?.desc}</option>)}
            </select>
          </label>
          {err && <p className="text-xs font-semibold text-[#B91C1C]">{err}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-xl px-4 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">Cancelar</button>
          <button type="button" onClick={submit} disabled={!valid || saving} className={`h-10 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-50 ${gradient}`}>{saving ? 'Enviando…' : 'Enviar invitación'}</button>
        </div>
      </div>
    </div>
  )
}

export default TeamScreen
