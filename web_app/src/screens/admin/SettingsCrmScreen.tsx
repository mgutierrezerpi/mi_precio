import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant, setTenant } from '../../store/slices/authSlice'
import api from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { Icon } from './crm/ui'
import { gradient, tone } from './crm/theme'

const sections = [
  'Información de la empresa', 'Marca y apariencia', 'Notificaciones',
  'Idioma y región', 'Seguridad', 'Plan y facturación', 'Datos fiscales', 'Eliminar cuenta',
]

const inputCls = 'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)]'

export function SettingsCrmScreen() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const [active, setActive] = useState(0)
  const [name, setName] = useState(tenant?.name ?? '')
  const [subdomain, setSubdomain] = useState(tenant?.subdomain ?? '')
  const [currency, setCurrency] = useState(tenant?.currency ?? 'UYU')
  const [email, setEmail] = useState('contacto@minegocio.com')
  const [phone, setPhone] = useState('+598 99 123 456')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    if (!tenant?.id) return
    setSaving(true)
    try {
      const res = await api.updateTenant(tenant.id, { name: name.trim(), subdomain: subdomain.trim(), currency })
      if (res.data) { dispatch(setTenant(res.data)); setSaved(true); setTimeout(() => setSaved(false), 2000) }
    } finally { setSaving(false) }
  }

  return (
    <CrmLayout active="Configuración" title="Configuración" subtitle="Administrá los datos y preferencias de tu cuenta." searchPlaceholder="Buscar…">
      <div className="flex min-w-[900px] gap-6 p-8">
        {/* Sub-nav */}
        <div className="flex w-[240px] shrink-0 flex-col gap-1 self-start rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 shadow-[0_18px_50px_-22px_rgba(30,27,75,0.18)]">
          {sections.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setActive(i)}
              className={`flex h-10 items-center rounded-xl px-3.5 text-left text-[13px] font-semibold ${i === active ? `text-white ${gradient}` : s === 'Eliminar cuenta' ? 'text-[#EF4444] hover:bg-[var(--dash-soft)]' : 'text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="flex flex-1 flex-col gap-5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-7 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
          {active === 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[20px] font-extrabold text-[var(--dash-text)]">Información de la empresa</h3>
                  <p className="text-xs font-medium text-[var(--dash-muted)]">Estos datos aparecen en tu lista pública.</p>
                </div>
                <button type="button" onClick={save} disabled={saving} className={`flex h-10 items-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${gradient}`}>
                  {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar cambios'}
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl" style={tone('violet')}><Icon name="package" size={28} /></span>
                <button type="button" className="flex h-9 items-center gap-2 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 text-[13px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"><Icon name="upload" size={15} /> Cambiar logo</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre del negocio"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
                <Field label="Subdominio"><input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} className={inputCls} /></Field>
                <Field label="Email de contacto"><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Field>
                <Field label="Teléfono"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></Field>
                <Field label="Moneda">
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
                    {['UYU', 'ARS', 'USD', 'BRL', 'CLP'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Descripción del negocio"><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contale a tus clientes qué vendés…" className={inputCls} /></Field>
            </>
          ) : (
            <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={tone('violet')}><Icon name="settings" size={24} /></span>
              <p className="text-sm font-semibold text-[var(--dash-text)]">{sections[active]}</p>
              <p className="text-xs font-medium text-[var(--dash-muted)]">Esta sección estará disponible próximamente.</p>
            </div>
          )}
        </div>
      </div>
    </CrmLayout>
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

export default SettingsCrmScreen
