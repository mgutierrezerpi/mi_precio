import type { TranslationEntry } from './i18nDictionary'
import { DICT_TOUR_BASICS } from './i18nDictionaryTourBasics'
import { DICT_TOUR_CONTROLS } from './i18nDictionaryTourControls'
import { DICT_TOUR_GUIDANCE } from './i18nDictionaryTourGuidance'
import { DICT_TOUR_STEPS } from './i18nDictionaryTourSteps'

export const DICT_TOUR: Record<string, TranslationEntry> = {
  ...DICT_TOUR_CONTROLS,
  ...DICT_TOUR_BASICS,
  ...DICT_TOUR_GUIDANCE,
  ...DICT_TOUR_STEPS,
}
