import type { TranslationEntry } from './i18nDictionary'
import { DICT_ANALYTICS_CATALOG } from './i18nDictionaryAnalyticsCatalog'
import { DICT_ANALYTICS_DASHBOARD } from './i18nDictionaryAnalyticsDashboard'
import { DICT_ANALYTICS_REPORTS } from './i18nDictionaryAnalyticsReports'

export const DICT_ANALYTICS: Record<string, TranslationEntry> = {
  ...DICT_ANALYTICS_DASHBOARD,
  ...DICT_ANALYTICS_CATALOG,
  ...DICT_ANALYTICS_REPORTS,
}
