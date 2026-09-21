import { describe, expect, it } from 'vitest'
import { DICT } from './i18nDictionary'

const PUBLIC_FALLBACK_KEYS = [
  'pub.catalogUnavailable',
  'pub.catalogUnavailableHint',
  'pub.listGone',
  'pub.listGoneOthers',
  'pub.seeCatalog',
  'pub.shopNotFound',
  'pub.shopNotFoundHint',
  'pub.lpHeadline',
  'pub.lpSub',
  'pub.lpFeat1',
  'pub.lpFeat2',
  'pub.lpFeat3',
  'pub.lpCta',
] as const

describe('translation dictionary', () => {
  it('has complete Spanish, English and Portuguese entries', () => {
    for (const [key, entry] of Object.entries(DICT)) {
      expect(entry.es, `${key}.es`).toBeTruthy()
      expect(entry.en, `${key}.en`).toBeTruthy()
      expect(entry.pt, `${key}.pt`).toBeTruthy()
    }
  })

  it('covers every public catalog fallback and landing key', () => {
    for (const key of PUBLIC_FALLBACK_KEYS) expect(DICT[key], key).toBeTruthy()
  })
})
