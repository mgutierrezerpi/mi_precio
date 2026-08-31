import type { Lang } from './i18n'
import type { TranslationEntry } from './i18nDictionary'

export type LanguageDictionary = Record<string, string>

/**
 * Converts the authoring format into a flat dictionary for one language.
 * Keeping translation lookup flat makes each runtime dictionary independent
 * of the selected language and gives callers a simple `key -> text` map.
 */
export function dictionaryForLanguage(
  entries: Record<string, TranslationEntry>,
  language: Lang
): LanguageDictionary {
  return Object.fromEntries(
    Object.entries(entries).map(([key, translation]) => [
      key,
      translation[language] ?? translation.es,
    ])
  )
}
