import { describe, expect, it } from 'vitest'
import {
  darken,
  lighten,
  readableOn,
  withAlpha,
} from '../../../src/lib/designColors'

const isHex = (c: string) => /^#[0-9a-f]{6}$/.test(c)

describe('lighten', () => {
  it('mixes toward white', () => {
    expect(lighten('#000000', 1)).toBe('#ffffff')
    expect(lighten('#000000', 0.5)).toBe('#808080')
  })

  it('leaves a colour alone at 0', () => {
    expect(lighten('#F59E0B', 0)).toBe('#f59e0b')
  })

  it('expands the three-digit form', () => {
    expect(lighten('#abc', 0)).toBe('#aabbcc')
  })

  it('never emits an out-of-range channel', () => {
    for (const amt of [-2, -0.9, 1.5, 2])
      expect(isHex(lighten('#F59E0B', amt))).toBe(true)
  })
})

describe('darken', () => {
  it('mixes toward black', () => {
    expect(darken('#ffffff', 1)).toBe('#000000')
    expect(darken('#ffffff', 0.5)).toBe('#808080')
  })

  it('actually darkens every channel, which negative lighten did not', () => {
    // #F59E0B through `lighten(hex, -0.9)` came out as "#ec47-d1": the red
    // channel had *risen* to 0xec and the blue had run past zero into an
    // unparseable string. This is the case that broke the photo template.
    const out = darken('#F59E0B', 0.9)
    expect(isHex(out)).toBe(true)
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(out.slice(i, i + 2), 16))
    expect(r).toBeLessThan(0xf5)
    expect(g).toBeLessThan(0x9e)
    expect(b).toBeLessThanOrEqual(0x0b)
  })

  it('stays a valid colour at the extremes', () => {
    for (const amt of [-1, 0, 1, 2])
      expect(isHex(darken('#0B1F30', amt))).toBe(true)
  })
})

describe('readableOn', () => {
  it('puts dark ink on a light ground and light ink on a dark one', () => {
    expect(readableOn('#FFFFFF')).not.toBe(readableOn('#000000'))
  })
})

describe('withAlpha', () => {
  it('appends the alpha channel', () => {
    expect(withAlpha('#F59E0B', 1)).toMatch(/^#f59e0bff$/i)
    expect(withAlpha('#F59E0B', 0)).toMatch(/^#f59e0b00$/i)
  })
})
