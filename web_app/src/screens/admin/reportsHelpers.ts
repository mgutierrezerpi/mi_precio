import { useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import { localeOf, normalizeLang, useT, type TFn } from '../../lib/i18n'
import { DICT_ANALYTICS } from '../../lib/i18nDictionaryAnalytics'
import type { ReportData } from '../../services/api'
import type { Tone } from './crm/theme'

export function useAnalyticsI18n() {
  const baseT = useT()
  const tenant = useAppSelector(selectTenant)
  const lang = normalizeLang(tenant?.language)
  const t: TFn = (key, vars) => {
    let value = DICT_ANALYTICS[key]?.[lang] ?? baseT(key)
    if (vars)
      for (const [name, replacement] of Object.entries(vars))
        value = value.replaceAll(`{${name}}`, String(replacement))
    return value
  }
  return { locale: localeOf(tenant?.language), t }
}

export const fmtInt = (value: number, locale: string) =>
  new Intl.NumberFormat(locale).format(value)

export function dayLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
    .format(new Date(`${iso}T00:00:00`))
    .replace('.', '')
}

export const channelMeta = (
  t: TFn
): { key: 'link' | 'qr'; name: string; color: string }[] => [
  { key: 'link', name: t('analytics.directLink'), color: '#7C3AED' },
  { key: 'qr', name: t('analytics.qrCode'), color: '#0EA5E9' },
]

export const PRODUCT_TONES: Tone[] = [
  'violet',
  'sky',
  'rose',
  'amber',
  'purple',
]
export type ReportSeries = NonNullable<ReportData['series']>
