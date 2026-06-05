import { describe, it, expect } from 'vitest'
import { generateQrMatrix } from './qrcode'

/**
 * Independent decoder used only to PROVE the generated QR is spec-valid (and therefore
 * scannable): it rebuilds the function-module map, reads the format info, removes the mask,
 * un-zig-zags the codewords, de-interleaves the blocks, checks every block's Reed-Solomon
 * syndrome is zero, and recovers the original UTF-8 payload. Tables/helpers mirror the spec.
 */

const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
]
const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
]
// Decode format-bits ECC field (L=1,M=0,Q=3,H=2) back to the table index (L=0,M=1,Q=2,H=3).
const FORMAT_TO_INDEX: Record<number, number> = { 1: 0, 0: 1, 3: 2, 2: 3 }

function rsMul(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x }
  return z & 0xff
}
function rsDivisor(degree: number): number[] {
  const r = new Array<number>(degree).fill(0); r[degree - 1] = 1; let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < r.length; j++) { r[j] = rsMul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1] }
    root = rsMul(root, 2)
  }
  return r
}
function rsRemainder(data: number[], divisor: number[]): number[] {
  const r = new Array<number>(divisor.length).fill(0)
  for (const b of data) { const f = b ^ r.shift()!; r.push(0); divisor.forEach((c, i) => { r[i] ^= rsMul(c, f) }) }
  return r
}
function numRawModules(version: number): number {
  let res = (16 * version + 128) * version + 64
  if (version >= 2) { const n = Math.floor(version / 7) + 2; res -= (25 * n - 10) * n - 55; if (version >= 7) res -= 36 }
  return res
}
function alignPositions(version: number): number[] {
  if (version === 1) return []
  const n = Math.floor(version / 7) + 2
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (n * 2 - 2)) * 2
  const res = [6]
  for (let pos = version * 4 + 10; res.length < n; pos -= step) res.splice(1, 0, pos)
  return res
}

function buildFunctionMap(version: number, size: number): boolean[][] {
  const fn: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  const mark = (x: number, y: number) => { if (x >= 0 && x < size && y >= 0 && y < size) fn[y][x] = true }
  for (let i = 0; i < size; i++) { mark(6, i); mark(i, 6) }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) mark(cx + dx, cy + dy)
  }
  const ap = alignPositions(version)
  for (let i = 0; i < ap.length; i++) for (let j = 0; j < ap.length; j++) {
    if ((i === 0 && j === 0) || (i === 0 && j === ap.length - 1) || (i === ap.length - 1 && j === 0)) continue
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) mark(ap[i] + dx, ap[j] + dy)
  }
  // Format areas.
  for (let i = 0; i <= 8; i++) { mark(8, i); mark(i, 8) }
  for (let i = 0; i < 8; i++) { mark(size - 1 - i, 8); mark(8, size - 1 - i) }
  mark(8, size - 8)
  // Version areas.
  if (version >= 7) for (let i = 0; i < 18; i++) { const a = size - 11 + (i % 3); const b = Math.floor(i / 3); mark(b, a); mark(a, b) }
  return fn
}

function readFormat(m: boolean[][]): { mask: number; eccIndex: number } {
  let bits = 0
  const read = (x: number, y: number) => { bits = (bits << 1) | (m[y][x] ? 1 : 0) }
  // Read the second copy (15 bits) from MSB (i=14) down to i=0.
  const size = m.length
  // i = 14..8 are along the bottom-left column, i = 7..0 along the top-right row.
  for (let i = 14; i >= 8; i--) read(8, size - 15 + i)
  for (let i = 7; i >= 0; i--) read(size - 1 - i, 8)
  const data = (bits ^ 0x5412) >>> 10
  return { mask: data & 7, eccIndex: FORMAT_TO_INDEX[(data >> 3) & 3] }
}

function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0
    case 1: return y % 2 === 0
    case 2: return x % 3 === 0
    case 3: return (x + y) % 3 === 0
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0
    default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
  }
}

function decode(text: string, ecc: 'L' | 'M' | 'Q' | 'H'): string {
  const m = generateQrMatrix(text, ecc)
  const size = m.length
  const version = (size - 17) / 4
  const fn = buildFunctionMap(version, size)
  const { mask, eccIndex } = readFormat(m)

  // De-mask + un-zig-zag into the codeword byte stream.
  const bitsArr: number[] = []
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5 // skip the timing column (mutates the decrement, as the encoder does)
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const upward = ((right + 1) & 2) === 0
        const y = upward ? size - 1 - vert : vert
        if (!fn[y][x]) bitsArr.push((m[y][x] !== maskBit(mask, x, y)) ? 1 : 0)
      }
    }
  }
  const codewords: number[] = []
  for (let i = 0; i + 8 <= bitsArr.length; i += 8) {
    let b = 0
    for (let k = 0; k < 8; k++) b = (b << 1) | bitsArr[i + k]
    codewords.push(b)
  }

  // De-interleave back into blocks.
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[eccIndex][version]
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[eccIndex][version]
  const rawCodewords = Math.floor(numRawModules(version) / 8)
  const numShort = numBlocks - (rawCodewords % numBlocks)
  const shortLen = Math.floor(rawCodewords / numBlocks)
  const blocks: number[][] = Array.from({ length: numBlocks }, () => [])
  let idx = 0
  const maxLen = shortLen + 1
  for (let i = 0; i < maxLen; i++) {
    for (let j = 0; j < numBlocks; j++) {
      if (i !== shortLen - blockEccLen || j >= numShort) { blocks[j].push(codewords[idx++]) }
    }
  }
  // Re-insert the skipped placeholder (0) so short blocks line up, then split data/ecc.
  const dataBytes: number[] = []
  for (let j = 0; j < numBlocks; j++) {
    const block = blocks[j]
    const dataLen = shortLen - blockEccLen + (j < numShort ? 0 : 1)
    const data = block.slice(0, dataLen)
    const eccPart = block.slice(dataLen)
    // Syndrome check: full codeword must be divisible by the generator (remainder = 0).
    const rem = rsRemainder([...data, ...eccPart], rsDivisor(blockEccLen))
    expect(rem.every((v) => v === 0)).toBe(true)
    dataBytes.push(...data)
  }

  // Parse byte-mode payload.
  const bitstream: number[] = []
  for (const byte of dataBytes) for (let k = 7; k >= 0; k--) bitstream.push((byte >> k) & 1)
  let p = 0
  const take = (n: number) => { let v = 0; for (let k = 0; k < n; k++) v = (v << 1) | bitstream[p++]; return v }
  const mode = take(4)
  expect(mode).toBe(0b0100) // byte mode
  const len = take(version <= 9 ? 8 : 16)
  const out: number[] = []
  for (let i = 0; i < len; i++) out.push(take(8))
  return new TextDecoder().decode(new Uint8Array(out))
}

describe('QR round-trip (proves scannability)', () => {
  const cases = [
    'https://miprecio.app/p/lavadero/lista-principal',
    'http://localhost:3000/p/matiasgarbi/lavadero',
    'a',
    'UYU $1.234 — café ☕ áéíóúñ',
    'x'.repeat(120),
  ]
  for (const ecc of ['L', 'M', 'Q', 'H'] as const) {
    for (const text of cases) {
      it(`decodes ${JSON.stringify(text.slice(0, 24))}… (ECC ${ecc})`, () => {
        expect(decode(text, ecc)).toBe(text)
      })
    }
  }
})
