import { describe, it, expect } from 'vitest'
import { generateQrMatrix } from './qrcode'

describe('generateQrMatrix', () => {
  it('produces a square matrix whose size matches a valid QR version', () => {
    const m = generateQrMatrix('https://miprecio.app/p/lavadero/precios')
    expect(m.length).toBeGreaterThan(0)
    expect(m.every((row) => row.length === m.length)).toBe(true)
    const version = (m.length - 17) / 4
    expect(Number.isInteger(version)).toBe(true)
    expect(version).toBeGreaterThanOrEqual(1)
    expect(version).toBeLessThanOrEqual(40)
  })

  it('draws the three finder patterns correctly', () => {
    const m = generateQrMatrix('hello world')
    const size = m.length
    // A finder centered at (cx,cy): dark when Chebyshev distance is 0,1,3; light at 2.
    const checkFinder = (cx: number, cy: number) => {
      expect(m[cy][cx]).toBe(true) // center
      expect(m[cy + 1][cx + 1]).toBe(true) // distance 1
      expect(m[cy + 2][cx + 2]).toBe(false) // distance 2 (light ring)
      expect(m[cy + 3][cx + 3]).toBe(true) // distance 3 (outer border)
    }
    checkFinder(3, 3)
    checkFinder(size - 4, 3)
    checkFinder(3, size - 4)
  })

  it('draws alternating timing patterns', () => {
    const m = generateQrMatrix('timing-check')
    const size = m.length
    for (let i = 8; i < size - 8; i++) {
      expect(m[6][i]).toBe(i % 2 === 0)
      expect(m[i][6]).toBe(i % 2 === 0)
    }
  })

  it('handles short and longer payloads without throwing', () => {
    expect(() => generateQrMatrix('a')).not.toThrow()
    expect(() => generateQrMatrix('x'.repeat(300))).not.toThrow()
    expect(() => generateQrMatrix('áéíóú ñ — UYU $1.234', 'H')).not.toThrow()
  })
})
