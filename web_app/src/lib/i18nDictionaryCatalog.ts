import { useT, normalizeLang, type TFn } from './i18n'
import type { TranslationEntry } from './i18nDictionary'
import { useAppSelector } from '../store/hooks'
import { selectTenant } from '../store/slices/authSlice'
import { DICT_CATALOG_CATEGORY_BROWSE } from './i18nDictionaryCatalogCategoryBrowse'
import { DICT_CATALOG_CATEGORY_EDIT } from './i18nDictionaryCatalogCategoryEdit'
import { DICT_CATALOG_CODES } from './i18nDictionaryCatalogCodes'
import { DICT_CATALOG_PRODUCT_BROWSE } from './i18nDictionaryCatalogProductBrowse'
import { DICT_CATALOG_PRODUCT_EDIT } from './i18nDictionaryCatalogProductEdit'

export const DICT_CATALOG: Record<string, TranslationEntry> = {
  ...DICT_CATALOG_PRODUCT_BROWSE,
  ...DICT_CATALOG_PRODUCT_EDIT,
  ...DICT_CATALOG_CATEGORY_BROWSE,
  ...DICT_CATALOG_CATEGORY_EDIT,
  ...DICT_CATALOG_CODES,
}

export function useCatalogT(): TFn {
  const fallbackT = useT()
  const tenant = useAppSelector(selectTenant)
  const language = normalizeLang(tenant?.language)
  return (key, vars) => {
    let value = DICT_CATALOG[key]?.[language] ?? fallbackT(key, vars)
    if (vars)
      for (const [name, replacement] of Object.entries(vars))
        value = value.replaceAll(`{${name}}`, String(replacement))
    return value
  }
}
