import { describe, expect, it } from 'vitest'
import { DICT_BASE_02 } from '../../src/lib/i18nDictionaryBase02'
import { defaultHeroStats } from '../../src/lib/publicHeroStats'
import type { TFn } from '../../src/lib/i18n'

const t = ((key: string) => key) as TFn
const base = { productCount: 12, updated: '18 nov 2026', t }

describe('defaultHeroStats', () => {
  it('leaves WhatsApp out when the shop has no number', () => {
    expect(defaultHeroStats({ ...base, whatsapp: null })).toEqual([
      ['12', 'store.statProducts'],
      ['18 nov 2026', 'store.statUpdated'],
    ])
  })

  it('shows the number the shop loaded, never an invented schedule', () => {
    const stats = defaultHeroStats({ ...base, whatsapp: '59899123456' })
    expect(stats).toContainEqual(['59899123456', 'store.statShipping'])
    expect(stats.flat()).not.toContain('24/7')
  })

  it('has no canned sales pitch left to publish', () => {
    expect(DICT_BASE_02).not.toHaveProperty(['store.heroSub'])
  })
})
