import { describe, expect, it } from 'vitest'
import { getT } from '../../lib/i18n'
import { cartTrustKey } from './cartTrust'

const LANGS = ['es', 'en', 'pt'] as const

describe('cartTrustKey', () => {
  it('says the shop keeps the details when it takes leads', () => {
    expect(cartTrustKey(true, 'whatsapp')).toBe('store.cartTrustLeads')
    expect(cartTrustKey(true, 'instagram')).toBe('store.cartTrustLeads')
    expect(getT('es')(cartTrustKey(true, 'whatsapp'))).toContain('guarda')
  })

  it('says nothing is stored when the shop does not take leads', () => {
    expect(getT('es')(cartTrustKey(false, 'whatsapp'))).toContain(
      'no se guardan'
    )
    expect(getT('es')(cartTrustKey(undefined, 'whatsapp'))).toContain(
      'WhatsApp'
    )
  })

  it('names the channel the order really leaves through', () => {
    expect(getT('es')(cartTrustKey(false, 'instagram'))).toContain('Instagram')
    expect(getT('es')(cartTrustKey(false, 'instagram'))).not.toContain(
      'WhatsApp'
    )
  })

  it.each(LANGS)('has its own wording in %s for every case', (lang) => {
    const t = getT(lang)
    const notices = [
      cartTrustKey(true, 'whatsapp'),
      cartTrustKey(false, 'whatsapp'),
      cartTrustKey(false, 'instagram'),
    ].map((key) => {
      expect(t(key)).not.toBe(key)
      return t(key)
    })
    expect(new Set(notices).size).toBe(3)
  })
})
