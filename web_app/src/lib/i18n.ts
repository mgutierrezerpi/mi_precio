import { useAppSelector } from '../store/hooks'
import { selectTenant } from '../store/slices/authSlice'
import { DICT } from './i18nDictionary'

export type Lang = 'es' | 'en' | 'pt'

export function normalizeLang(l?: string | null): Lang {
  return l === 'en' || l === 'pt' ? l : 'es'
}

/** Intl locale for date/number formatting per app language. */
export function localeOf(l?: string | null): string {
  return ({ es: 'es-AR', en: 'en-US', pt: 'pt-BR' } as const)[normalizeLang(l)]
}

export type TFn = (
  key: string,
  vars?: Record<string, string | number>
) => string

/** Build a translate function for a given language. */
export function getT(lang?: string | null): TFn {
  const L = normalizeLang(lang)
  return (key: string, vars?: Record<string, string | number>) => {
    let s = DICT[key]?.[L] ?? DICT[key]?.es ?? key
    if (vars)
      for (const [k, v] of Object.entries(vars))
        s = s.replaceAll(`{${k}}`, String(v))
    return s
  }
}

/** Admin translate hook: language comes from the current tenant. */
export function useT(): TFn {
  const tenant = useAppSelector(selectTenant)
  return getT(tenant?.language)
}
