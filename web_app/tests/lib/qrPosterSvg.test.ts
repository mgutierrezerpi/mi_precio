import { describe, expect, it } from 'vitest'
import { POSTER_H, POSTER_W, buildQrPosterSvg } from '../../src/lib/qrPosterSvg'

const base = {
  value: 'https://miprecio.app/p/test/menu?src=qr',
  headline: 'Escaneá y mirá la carta',
  footer: 'Hecho con MiPrecio · miprecio.app',
}

const parse = (svg: string) =>
  new DOMParser().parseFromString(svg, 'image/svg+xml')

const texts = (doc: Document) =>
  [...doc.querySelectorAll('text')].map((n) => n.textContent)

describe('buildQrPosterSvg', () => {
  it('is a well-formed SVG at A4 proportions', () => {
    const doc = parse(buildQrPosterSvg(base))

    expect(doc.querySelector('parsererror')).toBeNull()
    const root = doc.documentElement
    expect(root.tagName).toBe('svg')
    expect(root.getAttribute('width')).toBe(String(POSTER_W))
    expect(root.getAttribute('height')).toBe(String(POSTER_H))
    // 210 × 297 within rounding, whatever size it is scaled to.
    expect(POSTER_H / POSTER_W).toBeCloseTo(297 / 210, 2)
  })

  it('carries the code as vector paths, not as a bitmap', () => {
    const doc = parse(buildQrPosterSvg(base))
    const nested = doc.querySelectorAll('svg svg')

    expect(nested).toHaveLength(1)
    expect(nested[0].querySelector('path')?.getAttribute('d')).toBeTruthy()
  })

  it('wears our brand, since the sheet doubles as advertising', () => {
    const doc = parse(buildQrPosterSvg(base))
    const stops = [...doc.querySelectorAll('stop')].map((s) =>
      s.getAttribute('stop-color')
    )

    expect(stops).toEqual(['#7C3AED', '#C026D3'])
    expect(texts(doc)).toContain('Hecho con MiPrecio · miprecio.app')
  })

  it('keeps the code on a white card, away from the violet', () => {
    // Scanners need the contrast, and it keeps the brand colour doing the
    // branding instead of fighting the code.
    const doc = parse(buildQrPosterSvg(base))
    const card = [...doc.querySelectorAll('rect')].find(
      (r) => r.getAttribute('rx') === '48'
    )
    expect(card?.getAttribute('fill')).toBe('#FFFFFF')
  })

  it('carries nothing of the shop: the sheet is ours end to end', () => {
    // Which list it opens lives in the code and the file name, not on paper —
    // the customer is already standing in the shop.
    const doc = parse(buildQrPosterSvg(base))

    expect(texts(doc)).toEqual([
      'MiPrecio',
      'Escaneá y mirá la carta',
      'Hecho con MiPrecio · miprecio.app',
    ])
  })

  it('falls back to the wordmark when the logo file cannot be loaded', () => {
    const doc = parse(buildQrPosterSvg(base))

    expect(doc.querySelectorAll('image')).toHaveLength(0)
    expect(texts(doc)).toContain('MiPrecio')
  })

  it('places the mark without squashing it', () => {
    const doc = parse(
      buildQrPosterSvg({
        ...base,
        logoDataUrl: 'data:image/png;base64,AAAA',
        logoAspect: 4,
      })
    )
    const mark = doc.querySelector('image')!

    expect(Number(mark.getAttribute('width'))).toBe(
      Number(mark.getAttribute('height')) * 4
    )
    expect(mark.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet')
    // Both spellings: older renderers only know the namespaced one.
    expect(mark.getAttribute('href')).toBeTruthy()
    expect(
      mark.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
    ).toBeTruthy()
  })

  it('escapes copy that would otherwise break the markup', () => {
    const doc = parse(
      buildQrPosterSvg({ ...base, headline: 'Mirá <b>&</b> "pedí"' })
    )

    expect(doc.querySelector('parsererror')).toBeNull()
    expect(texts(doc)).toContain('Mirá <b>&</b> "pedí"')
  })

  it('balances the air above the mark against the air under the footer', () => {
    // An unbalanced sheet reads as a mistake even to someone who cannot say
    // why, and the first draft had 250px of sky over a 94px floor.
    const svg = buildQrPosterSvg({
      ...base,
      logoDataUrl: 'data:image/png;base64,AAAA',
      logoAspect: 3.04,
    })
    const doc = parse(svg)
    const mark = doc.querySelector('image')!
    const top = Number(mark.getAttribute('y'))

    const footer = [...doc.querySelectorAll('text')].at(-1)!
    const bottom = POSTER_H - Number(footer.getAttribute('y'))

    expect(top).toBeGreaterThan(100)
    // Within a quarter of each other: optically even, bottom a touch heavier.
    expect(Math.abs(top - bottom) / Math.max(top, bottom)).toBeLessThan(0.25)
  })
})
