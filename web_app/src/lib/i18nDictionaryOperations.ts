import type { TranslationEntry } from './i18nDictionary'
import { DICT_OPERATIONS_CUSTOMERS } from './i18nDictionaryOperationsCustomers'
import { DICT_OPERATIONS_PURCHASES } from './i18nDictionaryOperationsPurchases'
import { DICT_OPERATIONS_SUPPORT } from './i18nDictionaryOperationsSupport'
import { DICT_OPERATIONS_TEAM } from './i18nDictionaryOperationsTeam'
import { DICT_OPERATIONS_VIEWERS } from './i18nDictionaryOperationsViewers'

export const DICT_OPERATIONS: Record<string, TranslationEntry> = {
  ...DICT_OPERATIONS_CUSTOMERS,
  ...DICT_OPERATIONS_VIEWERS,
  ...DICT_OPERATIONS_PURCHASES,
  ...DICT_OPERATIONS_TEAM,
  ...DICT_OPERATIONS_SUPPORT,
}
