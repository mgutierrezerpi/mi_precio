import { DICT_EXTRA } from './i18nDictionaryExtra'
import { DICT_LEADS } from './i18nDictionaryLeads'
import { DICT_LISTS } from './i18nDictionaryLists'
import { DICT_SOCIALS } from './i18nDictionarySocials'
import { DICT_TOUR } from './i18nDictionaryTour'
import { DICT_BASE_01 } from './i18nDictionaryBase01'
import { DICT_BASE_02 } from './i18nDictionaryBase02'
import { DICT_BASE_03 } from './i18nDictionaryBase03'
import { DICT_BASE_04 } from './i18nDictionaryBase04'
import { DICT_BASE_05 } from './i18nDictionaryBase05'
import { DICT_BASE_06 } from './i18nDictionaryBase06'
import { DICT_BASE_07 } from './i18nDictionaryBase07'
import { DICT_BASE_08 } from './i18nDictionaryBase08'
import { DICT_BASE_09 } from './i18nDictionaryBase09'
import { DICT_BASE_10 } from './i18nDictionaryBase10'
import { DICT_BASE_11 } from './i18nDictionaryBase11'
import { DICT_BASE_12 } from './i18nDictionaryBase12'
import { DICT_BASE_13 } from './i18nDictionaryBase13'
import { DICT_BASE_14 } from './i18nDictionaryBase14'

export type { TranslationEntry } from './i18nTypes'

export const DICT = {
  ...DICT_BASE_01,
  ...DICT_BASE_02,
  ...DICT_BASE_03,
  ...DICT_BASE_04,
  ...DICT_BASE_05,
  ...DICT_BASE_06,
  ...DICT_BASE_07,
  ...DICT_BASE_08,
  ...DICT_BASE_09,
  ...DICT_BASE_10,
  ...DICT_BASE_11,
  ...DICT_BASE_12,
  ...DICT_BASE_13,
  ...DICT_BASE_14,
  ...DICT_EXTRA,
  ...DICT_TOUR,
  ...DICT_SOCIALS,
  ...DICT_LEADS,
  ...DICT_LISTS,
}
