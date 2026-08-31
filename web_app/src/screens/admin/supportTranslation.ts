import { normalizeLang, useT, type TFn } from '../../lib/i18n'
import { DICT_OPERATIONS } from '../../lib/i18nDictionaryOperations'
import { useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import type { Tone } from './crm/theme'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type SetState<T> = (value: T) => void

export const PRIORITIES: { id: Priority; key: string; t: Tone }[] = [
  { id: 'low', key: 'support.low', t: 'slate' },
  { id: 'medium', key: 'support.medium', t: 'sky' },
  { id: 'high', key: 'support.high', t: 'amber' },
  { id: 'urgent', key: 'support.urgent', t: 'rose' },
]
export const SUPPORT_EMAIL = 'soporte@miprecio.app'

export function useOperationsT(): TFn {
  const t = useT()
  const language = useAppSelector(selectTenant)?.language
  const lang = normalizeLang(language)
  return (key, vars) => {
    let value = DICT_OPERATIONS[key]?.[lang] ?? t(key, vars)
    if (vars)
      for (const [name, variable] of Object.entries(vars))
        value = value.replaceAll(`{${name}}`, String(variable))
    return value
  }
}
