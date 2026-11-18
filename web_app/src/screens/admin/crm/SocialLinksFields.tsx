import { useEffect, useRef, useState } from 'react'
import { SocialIcon } from '../../../components/SocialIcon'
import type { TFn } from '../../../lib/i18n'
import {
  SOCIALS,
  shopSocials,
  socialError,
  type SocialId,
} from '../../../lib/socials'
import type { Tenant } from '../../../types'

type SocialPatch = Partial<Record<SocialId, string | null>>

const inputCls =
  'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)] disabled:opacity-60'

/** The shop's social links, autosaved like the other brand fields.
 *
 *  Only the fields the owner changed are sent, and one with an error is held
 *  back: a rejected PATCH would tell the shop nothing about which field failed,
 *  and a field nobody touched must not block the one being edited. */
export function useSocialLinks(
  tenant: Tenant | null,
  canManage: boolean,
  save: (patch: SocialPatch) => void | Promise<void>
) {
  const [values, setValues] = useState<Record<SocialId, string>>(() => {
    const stored = tenant ? shopSocials(tenant) : {}
    return Object.fromEntries(
      SOCIALS.map((social) => {
        const value = stored[social.id] ?? ''
        // Stored as bare digits, which do not read as the shop's phone number.
        // The API strips the + again on the way in.
        const shown =
          social.id === 'socialWhatsapp' && value ? `+${value}` : value
        return [social.id, shown]
      })
    ) as Record<SocialId, string>
  })
  const [changed, setChanged] = useState<SocialId[]>([])
  const saveRef = useRef(save)
  useEffect(() => {
    saveRef.current = save
  })

  const errors = Object.fromEntries(
    SOCIALS.map((social) => [
      social.id,
      changed.includes(social.id)
        ? socialError(social.id, values[social.id])
        : null,
    ])
  ) as Record<SocialId, string | null>
  const invalid = SOCIALS.some((social) => errors[social.id])

  useEffect(() => {
    if (!canManage || !changed.length || invalid) return
    const timer = setTimeout(() => {
      setChanged([])
      void saveRef.current(
        Object.fromEntries(
          changed.map((id) => [id, values[id].trim() || null])
        ) as SocialPatch
      )
    }, 600)
    return () => clearTimeout(timer)
  }, [values, changed, invalid, canManage])

  const change = (id: SocialId, value: string) => {
    setChanged((current) => (current.includes(id) ? current : [...current, id]))
    setValues((current) => ({ ...current, [id]: value }))
  }
  return { values, errors, change }
}

export function SocialLinksFields({
  accent,
  canManage,
  change,
  errors,
  t,
  values,
}: {
  accent: string
  canManage: boolean
  change: (id: SocialId, value: string) => void
  errors: Record<SocialId, string | null>
  t: TFn
  values: Record<SocialId, string>
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--dash-border)] pt-5">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-bold text-[var(--dash-text)]">
          {t('social.title')}
        </p>
        <p className="text-xs font-medium text-[var(--dash-muted)]">
          {t('social.subtitle')}
        </p>
      </div>
      {SOCIALS.map((social) => (
        <label key={social.id} className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[var(--dash-text2)]">
            {t(social.tKey)}
          </span>
          <span className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${accent}1A`, color: accent }}
            >
              <SocialIcon id={social.id} size={17} />
            </span>
            <input
              type={social.id === 'socialWhatsapp' ? 'tel' : 'text'}
              value={values[social.id]}
              onChange={(e) => change(social.id, e.target.value)}
              disabled={!canManage}
              placeholder={social.placeholder}
              aria-invalid={!!errors[social.id]}
              className={inputCls}
            />
          </span>
          {social.id === 'socialWhatsapp' && (
            <span className="text-xs font-medium text-[var(--dash-muted)]">
              {t('social.whatsappHelp')}
            </span>
          )}
          {errors[social.id] && (
            <span
              role="alert"
              className="text-xs font-semibold text-[var(--tone-red-fg)]"
            >
              {t(errors[social.id]!)}
            </span>
          )}
        </label>
      ))}
    </div>
  )
}
