import { describe, expect, it } from 'vitest'
import { classifyLogoInk } from './logoInk'

/** RGBA pixels: `n` of each [r, g, b, a]. */
const pixels = (...runs: Array<[number, [number, number, number, number]]>) =>
  runs.flatMap(([n, px]) => Array.from({ length: n }, () => px)).flat()

const clear: [number, number, number, number] = [0, 0, 0, 0]
const white: [number, number, number, number] = [250, 250, 250, 255]
const black: [number, number, number, number] = [15, 15, 15, 255]
// The cup's mid-tone brown: neither light nor dark.
const brown: [number, number, number, number] = [170, 120, 70, 255]

describe('classifyLogoInk', () => {
  it('reads a white wordmark on transparency as made for dark grounds', () => {
    // Café Aurora's shape: mostly transparent, the ink mostly white.
    expect(classifyLogoInk(pixels([69, clear], [18, white], [13, brown]))).toBe(
      'light'
    )
  })

  it('keeps the tile for dark ink on transparency', () => {
    expect(classifyLogoInk(pixels([60, clear], [40, black]))).toBe('other')
  })

  it('keeps the tile for an opaque logo, whatever its colours', () => {
    // A white box with a mark in it already brings its own ground.
    expect(classifyLogoInk(pixels([80, white], [20, black]))).toBe('other')
  })

  it('keeps the tile when there is nothing to read', () => {
    expect(classifyLogoInk([])).toBe('other')
    expect(classifyLogoInk(pixels([10, clear]))).toBe('other')
  })
})
