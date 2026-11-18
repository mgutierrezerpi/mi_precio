import { describe, expect, it } from 'vitest'
import { privateListPalette } from '../../src/lib/privateListPalette'

describe('privateListPalette', () => {
  it('wears the color of the shop', () => {
    const palette = privateListPalette('#7C3AED')
    expect(palette.accent).toBe('#7C3AED')
    expect(palette.onAccent).toBe('#FFFFFF')
  })

  it('falls back to the default accent of the public list', () => {
    expect(privateListPalette(null).accent).toBe('#7C3AED')
  })

  it('keeps text readable on a light brand color', () => {
    const palette = privateListPalette('#FDE047')
    expect(palette.onAccent).toBe('#141414')
    expect(palette.ink).not.toBe('#FDE047')
    const [red, green, blue] = [1, 3, 5].map((start) =>
      Number.parseInt(palette.ink.slice(start, start + 2), 16)
    )
    expect((0.299 * red + 0.587 * green + 0.114 * blue) / 255).toBeLessThan(0.5)
  })
})
