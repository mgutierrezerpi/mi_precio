import { describe, expect, it } from 'vitest'
import { SOCIALS, activeSocials, hrefOf, socialError } from '../../src/lib/socials'

describe('hrefOf', () => {
  it('builds the wa.me link from the stored digits', () => {
    expect(hrefOf('socialWhatsapp', '59899123456')).toBe(
      'https://wa.me/59899123456'
    )
  })

  it('strips punctuation a shop may have typed into the phone', () => {
    expect(hrefOf('socialWhatsapp', '+598 99 123 456')).toBe(
      'https://wa.me/59899123456'
    )
  })

  it('passes through the URL the API already normalised', () => {
    expect(hrefOf('socialInstagram', 'https://instagram.com/micafe')).toBe(
      'https://instagram.com/micafe'
    )
  })

  it('never emits a scheme-less link, which would resolve as a relative path', () => {
    // A row written before the API normalised these would otherwise send the
    // customer to /p/shop/instagram.com/micafe instead of off-site.
    expect(hrefOf('socialInstagram', 'instagram.com/micafe')).toBe(
      'https://instagram.com/micafe'
    )
  })

  it.each([null, undefined, '', '   '])('has no link for %p', (value) => {
    expect(hrefOf('socialInstagram', value)).toBeNull()
  })
})

describe('activeSocials', () => {
  it('returns only what the shop filled in, in display order', () => {
    const active = activeSocials({
      socialWebsite: 'https://micafe.uy',
      socialInstagram: 'https://instagram.com/micafe',
      socialFacebook: null,
    })

    expect(active.map((s) => s.id)).toEqual([
      'socialInstagram',
      'socialWebsite',
    ])
  })

  it('is empty for a shop with no networks, so the footer renders nothing', () => {
    expect(activeSocials({})).toEqual([])
  })

  it('gives every entry a usable href', () => {
    const active = activeSocials(
      Object.fromEntries(
        SOCIALS.map((s) => [
          s.id,
          s.id === 'socialWhatsapp' ? '59899123456' : 'micafe.uy',
        ])
      )
    )
    expect(active).toHaveLength(SOCIALS.length)
    for (const social of active) expect(social.href).toMatch(/^https?:\/\//)
  })

  it('drops a whatsapp value with no digits instead of linking to wa.me/', () => {
    expect(activeSocials({ socialWhatsapp: 'llamanos' })).toEqual([])
  })
})

describe('socialError', () => {
  it('accepts a bare handle on the networks with a known profile shape', () => {
    expect(socialError('socialInstagram', '@micafe')).toBeNull()
    expect(socialError('socialTiktok', 'micafe')).toBeNull()
  })

  it('rejects a bare handle as a website, which has no canonical shape', () => {
    expect(socialError('socialWebsite', 'micafe')).toBe('social.error.link')
  })

  it.each([
    'instagram.com/micafe',
    'https://instagram.com/micafe',
    'www.micafe.uy',
  ])('accepts %s', (value) => {
    expect(socialError('socialInstagram', value)).toBeNull()
  })

  it('rejects a script url rather than letting it reach the footer', () => {
    expect(socialError('socialWebsite', 'javascript:alert(1)')).toBe(
      'social.error.link'
    )
  })

  it('flags an overlong link', () => {
    expect(socialError('socialWebsite', `micafe.uy/${'x'.repeat(600)}`)).toBe(
      'social.error.long'
    )
  })

  it.each(['', '   ', '@'])(
    'treats %p as an empty field, not an error',
    (value) => {
      expect(socialError('socialInstagram', value)).toBeNull()
    }
  )

  it('wants a phone with a country code for whatsapp', () => {
    expect(socialError('socialWhatsapp', '+598 99 123 456')).toBeNull()
    expect(socialError('socialWhatsapp', '12345')).toBe('social.error.phone')
    expect(socialError('socialWhatsapp', '1'.repeat(16))).toBe(
      'social.error.phone'
    )
  })
})
