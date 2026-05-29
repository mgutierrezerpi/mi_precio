import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { selectTenant, setTenant } from '../../store/slices/authSlice'
import { CURRENCIES, DEFAULT_CURRENCY } from '../../constants'
import api from '../../services/api'

export function SettingsScreen() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)

  const [name, setName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tenant) {
      setName(tenant.name)
      setSubdomain(tenant.subdomain)
      setCurrency(tenant.currency || DEFAULT_CURRENCY)
    }
  }, [tenant])

  const handleSave = async () => {
    if (!tenant?.id) return

    setSaving(true)
    setSaved(false)
    setError(null)

    const response = await api.updateTenant(tenant.id, { name, subdomain, currency })

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      dispatch(setTenant(response.data))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }

    setSaving(false)
  }

  const hasChanges = tenant && (
    name !== tenant.name ||
    subdomain !== tenant.subdomain ||
    currency !== (tenant.currency || DEFAULT_CURRENCY)
  )

  const normalizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '')

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-12">
        <h1 className="text-4xl font-light text-[var(--color-text-primary)] tracking-wide">
          Ajustes
        </h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          Configura tu negocio
        </p>
      </div>

      <div className="space-y-8">
        {/* Business Name */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
            Nombre del negocio
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            placeholder="Mi Negocio"
          />
        </div>

        {/* Public URL */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
            URL pública
          </label>
          <div className="flex items-center gap-0 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden focus-within:border-[var(--color-accent)] transition-colors">
            <span className="px-4 py-3 text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)]">
              {window.location.host}/p/
            </span>
            <input
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 px-4 py-3 bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none"
              placeholder="mi-negocio"
            />
          </div>
          {subdomain !== normalizedSubdomain && (
            <p className="text-xs text-amber-400 mt-2">
              Solo se permiten letras minúsculas, números y guiones
            </p>
          )}
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            Esta es la dirección donde tus clientes pueden ver tu lista de precios
          </p>
        </div>

        {/* Currency */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
            Moneda
          </label>
          <div className="grid grid-cols-3 gap-3">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  currency === c.code
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-light)] bg-[var(--color-bg-elevated)]'
                }`}
              >
                <span className={`text-lg font-medium ${
                  currency === c.code ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'
                }`}>
                  {c.code}
                </span>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {c.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="text-emerald-400 text-sm flex items-center gap-2">
              <CheckIcon className="w-4 h-4" />
              Guardado
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-8 py-4 bg-[var(--color-accent)] text-[var(--color-bg-primary)] font-medium rounded-xl hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

export default SettingsScreen
