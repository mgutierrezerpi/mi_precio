import { useState, type CSSProperties, type FormEvent } from 'react'
import { privateListPalette } from '../../lib/privateListPalette'
import api, { type PrivateListShop } from '../../services/api'

/** Asks for the access code of a private list, dressed in the shop's brand. */
export function PrivateListGate({
  subdomain,
  listId,
  shop,
}: {
  subdomain: string
  listId: string
  shop?: PrivateListShop
}) {
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const palette = privateListPalette(shop?.brandColor)

  const unlock = async (event: FormEvent) => {
    event.preventDefault()
    if (!code.trim()) return
    setSaving(true)
    setInvalid(false)
    const response = await api.unlockPublicList(subdomain, listId, code)
    setSaving(false)
    if (response.data) window.location.reload()
    else setInvalid(true)
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 font-sans"
      style={{ background: palette.accent }}
    >
      <form
        onSubmit={unlock}
        className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl"
      >
        {shop?.logoUrl ? (
          <img
            src={shop.logoUrl}
            alt={shop.name}
            className="mx-auto mb-4 h-12 w-auto max-w-[160px] object-contain"
          />
        ) : (
          shop?.name && (
            <p className="mb-3 text-base font-extrabold text-[#0F0D1A]">
              {shop.name}
            </p>
          )
        )}
        <p
          className="text-xs font-extrabold uppercase tracking-[0.18em]"
          style={{ color: palette.ink }}
        >
          Lista privada
        </p>
        <h1 className="mt-3 text-2xl font-extrabold text-[#0F0D1A]">
          Ingresá tu código
        </h1>
        <p className="mt-2 text-sm font-medium text-[#44424E]">
          Esta lista está disponible solo para personas invitadas.
        </p>
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-6 w-full rounded-xl border-2 border-[var(--gate-border)] bg-[var(--gate-field)] px-4 py-3 text-center font-bold tracking-[0.08em] text-[#0F0D1A] outline-none placeholder:text-[#6B6875] focus:border-[var(--gate-ink)] focus:ring-4 focus:ring-[var(--gate-ring)]"
          style={
            {
              '--gate-border': palette.fieldBorder,
              '--gate-field': palette.fieldBg,
              '--gate-ink': palette.ink,
              '--gate-ring': palette.focusRing,
            } as CSSProperties
          }
          placeholder="Código de acceso"
        />
        {invalid && (
          <p className="mt-2 text-xs font-semibold text-red-600">
            El código no es válido. Intentá de nuevo.
          </p>
        )}
        <button
          disabled={saving}
          className="mt-4 w-full rounded-xl py-3 text-sm font-extrabold transition hover:brightness-95 active:translate-y-px disabled:opacity-60"
          style={{
            background: palette.accent,
            color: palette.onAccent,
            boxShadow: `0 4px 0 ${palette.pressed}`,
          }}
        >
          {saving ? 'Verificando…' : 'Ver lista'}
        </button>
      </form>
    </main>
  )
}
