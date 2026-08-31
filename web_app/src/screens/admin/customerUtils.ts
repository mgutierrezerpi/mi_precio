import { useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import type { Customer } from '../../types'
import { localeOf, normalizeLang, useT } from '../../lib/i18n'
import { DICT_OPERATIONS } from '../../lib/i18nDictionaryOperations'
import type { Tone } from './crm/theme'

export function useOperationsT() {
  const fallbackT = useT()
  const language = useAppSelector(selectTenant)?.language
  const lang = normalizeLang(language)
  return (key: string, vars?: Record<string, string | number>) => {
    let value = DICT_OPERATIONS[key]?.[lang] ?? fallbackT(key, vars)
    if (vars)
      for (const [name, variable] of Object.entries(vars))
        value = value.replaceAll(`{${name}}`, String(variable))
    return value
  }
}

type Status = 'Activo' | 'Inactivo' | 'Nuevo'
export const statusTone: Record<Status, Tone> = {
  Activo: 'green',
  Inactivo: 'slate',
  Nuevo: 'violet',
}

const TONE_POOL: Tone[] = [
  'violet',
  'sky',
  'blue',
  'green',
  'amber',
  'rose',
  'purple',
]
export function avatarTone(name: string): Tone {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return TONE_POOL[h % TONE_POOL.length]
}
export const initials = (n: string) =>
  n
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?'

export function uniqueEmails(values: Array<string | null | undefined>): string[] {
  const unique = new Set<string>()
  for (const email of values) {
    const normalized = email?.trim().toLowerCase()
    if (normalized) unique.add(normalized)
  }
  return Array.from(unique)
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

// Backend stores naive UTC; tag as UTC so the browser converts to the right local time.
function parseUtc(iso?: string | null): Date | null {
  if (!iso) return null
  const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso)
  const d = new Date(hasTz ? iso : `${iso}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}
export function relativeTime(
  iso: string | null | undefined,
  t: (key: string, vars?: Record<string, string | number>) => string
): string {
  const d = parseUtc(iso)
  if (!d) return t('time.noPurchases')
  const s = (Date.now() - d.getTime()) / 1000
  if (s < 60) return t('time.justNow')
  if (s < 3600) return t('time.minutesAgo', { count: Math.floor(s / 60) })
  if (s < 86400) return t('time.hoursAgo', { count: Math.floor(s / 3600) })
  const days = Math.floor(s / 86400)
  if (days < 2) return t('time.yesterday')
  if (days < 30) return t('time.daysAgo', { count: days })
  if (days < 60) return t('time.oneMonthAgo')
  return t('time.monthsAgo', { count: Math.floor(days / 30) })
}
export function fullDate(iso: string | null | undefined, locale = localeOf()): string {
  const d = parseUtc(iso)
  return d
    ? d.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—'
}

export function statusOf(c: Customer): Status {
  if (c.ordersCount === 0) return 'Nuevo'
  const last = parseUtc(c.lastOrderAt)
  if (last && (Date.now() - last.getTime()) / 86400000 <= 30) return 'Activo'
  return 'Inactivo'
}
export function statusLabel(status: Status, t: (key: string) => string) {
  return t(`status.${status.toLowerCase()}`)
}
