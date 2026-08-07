/**
 * Minimal QR Code generator (byte mode) — TypeScript port of Nayuki's reference
 * implementation (MIT License, https://www.nayuki.io/page/qr-code-generator-library).
 *
 * Vendored instead of adding an npm dependency so it works with the Docker bind-mount /
 * HMR setup without rebuilding the image. Encodes any string (UTF-8 byte mode), picks the
 * smallest fitting version and the lowest-penalty mask, and exposes the module matrix so
 * callers can render it however they want (SVG, canvas, with custom colors / center logo).
 */

export type Ecc = 'L' | 'M' | 'Q' | 'H'

const ECC_FORMAT_BITS: Record<Ecc, number> = { L: 1, M: 0, Q: 3, H: 2 }
const ECC_INDEX: Record<Ecc, number> = { L: 0, M: 1, Q: 2, H: 3 }

// Number of error-correction codewords per block, indexed [eccIndex][version].
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  [
    -1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30,
    28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ],
  [
    -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26,
    26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28,
  ],
  [
    -1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28,
    26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ],
  [
    -1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28,
    26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ],
]

// Number of error-correction blocks, indexed [eccIndex][version].
const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  [
    -1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10,
    12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
  ],
  [
    -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17,
    17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
  ],
  [
    -1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23,
    23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68,
  ],
  [
    -1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25,
    25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77,
    81,
  ],
]

const MIN_VERSION = 1
const MAX_VERSION = 40

/** Returns a square boolean matrix where true = dark module. */
export function generateQrMatrix(text: string, ecc: Ecc = 'M'): boolean[][] {
  const data = toUtf8(text)

  // Pick the smallest version that fits the data at the requested ECC level.
  let version = MIN_VERSION
  let dataCapacityBits = 0
  for (; ; version++) {
    if (version > MAX_VERSION) throw new Error('Data too long for a QR code')
    dataCapacityBits = getNumDataCodewords(version, ecc) * 8
    const usedBits = 4 + getCharCountBits(version) + data.length * 8
    if (usedBits <= dataCapacityBits) break
  }

  // Build the bit stream: byte-mode indicator + char count + data.
  const bits: number[] = []
  appendBits(0b0100, 4, bits)
  appendBits(data.length, getCharCountBits(version), bits)
  for (const b of data) appendBits(b, 8, bits)

  // Terminator + pad to a byte boundary + alternating pad bytes.
  appendBits(0, Math.min(4, dataCapacityBits - bits.length), bits)
  appendBits(0, (8 - (bits.length % 8)) % 8, bits)
  for (let pad = 0xec; bits.length < dataCapacityBits; pad ^= 0xec ^ 0x11)
    appendBits(pad, 8, bits)

  const dataCodewords = new Array<number>(bits.length / 8).fill(0)
  bits.forEach((bit, i) => {
    dataCodewords[i >>> 3] |= bit << (7 - (i & 7))
  })

  const allCodewords = addEccAndInterleave(dataCodewords, version, ecc)
  return drawQr(version, ecc, allCodewords)
}

function getCharCountBits(version: number): number {
  // Byte mode character-count field width by version range.
  return version <= 9 ? 8 : 16
}

function appendBits(value: number, len: number, out: number[]): void {
  for (let i = len - 1; i >= 0; i--) out.push((value >>> i) & 1)
}

function toUtf8(str: string): number[] {
  return Array.from(new TextEncoder().encode(str))
}

function getNumRawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2
    result -= (25 * numAlign - 10) * numAlign - 55
    if (version >= 7) result -= 36
  }
  return result
}

function getNumDataCodewords(version: number, ecc: Ecc): number {
  const e = ECC_INDEX[ecc]
  return (
    Math.floor(getNumRawDataModules(version) / 8) -
    ECC_CODEWORDS_PER_BLOCK[e][version] *
      NUM_ERROR_CORRECTION_BLOCKS[e][version]
  )
}

// ---- Reed-Solomon error correction ----

function addEccAndInterleave(
  data: number[],
  version: number,
  ecc: Ecc
): number[] {
  const e = ECC_INDEX[ecc]
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[e][version]
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[e][version]
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8)
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks)
  const shortBlockLen = Math.floor(rawCodewords / numBlocks)

  const blocks: number[][] = []
  const rsDiv = reedSolomonComputeDivisor(blockEccLen)
  let k = 0
  for (let i = 0; i < numBlocks; i++) {
    const datLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1)
    const dat = data.slice(k, k + datLen)
    k += datLen
    const block = dat.slice()
    const eccBytes = reedSolomonComputeRemainder(dat, rsDiv)
    if (i < numShortBlocks) block.push(0) // placeholder to keep columns aligned
    block.push(...eccBytes)
    blocks.push(block)
  }

  // Interleave the blocks column by column.
  const result: number[] = []
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      // The placeholder byte at index (shortBlockLen - blockEccLen) is skipped.
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks)
        result.push(block[i])
    })
  }
  return result
}

function reedSolomonComputeDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0)
  result[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = reedSolomonMultiply(result[j], root)
      if (j + 1 < result.length) result[j] ^= result[j + 1]
    }
    root = reedSolomonMultiply(root, 0x02)
  }
  return result
}

function reedSolomonComputeRemainder(
  data: number[],
  divisor: number[]
): number[] {
  const result = new Array<number>(divisor.length).fill(0)
  for (const b of data) {
    const factor = b ^ result.shift()!
    result.push(0)
    divisor.forEach((coef, i) => {
      result[i] ^= reedSolomonMultiply(coef, factor)
    })
  }
  return result
}

function reedSolomonMultiply(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> i) & 1) * x
  }
  return z & 0xff
}

// ---- Module placement ----

function drawQr(version: number, ecc: Ecc, codewords: number[]): boolean[][] {
  const size = version * 4 + 17
  const modules: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false)
  )
  const isFunction: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false)
  )

  drawFunctionPatterns(version, modules, isFunction, size)
  drawFormatBits(ecc, 0, modules, isFunction, size, true)
  drawVersion(version, modules, isFunction, size)
  drawCodewords(codewords, modules, isFunction, size)
  const bestMask = selectBestMask(ecc, modules, isFunction, size)
  applyMask(bestMask, modules, isFunction, size)
  drawFormatBits(ecc, bestMask, modules, isFunction, size, false)
  return modules
}

function drawFunctionPatterns(
  version: number,
  modules: boolean[][],
  isFunction: boolean[][],
  size: number
): void {
  const set = (x: number, y: number, dark: boolean) => {
    modules[y][x] = dark
    isFunction[y][x] = true
  }
  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0)
    set(i, 6, i % 2 === 0)
  }
  for (const [x, y] of [
    [3, 3],
    [size - 4, 3],
    [3, size - 4],
  ])
    drawFinderPattern(x, y, size, set)
  drawAlignmentPatterns(version, set)
}

function drawFinderPattern(
  centerX: number,
  centerY: number,
  size: number,
  set: (x: number, y: number, dark: boolean) => void
): void {
  for (let y = -4; y <= 4; y++)
    for (let x = -4; x <= 4; x++) {
      const moduleX = centerX + x
      const moduleY = centerY + y
      if (moduleX >= 0 && moduleX < size && moduleY >= 0 && moduleY < size)
        set(
          moduleX,
          moduleY,
          Math.max(Math.abs(x), Math.abs(y)) !== 2 &&
            Math.max(Math.abs(x), Math.abs(y)) !== 4
        )
    }
}

function drawAlignmentPatterns(
  version: number,
  set: (x: number, y: number, dark: boolean) => void
): void {
  const positions = getAlignmentPatternPositions(version)
  for (let row = 0; row < positions.length; row++)
    for (let column = 0; column < positions.length; column++) {
      if (isFinderCorner(row, column, positions.length)) continue
      drawAlignmentPattern(positions[column], positions[row], set)
    }
}

function isFinderCorner(row: number, column: number, last: number): boolean {
  return (
    (row === 0 && column === 0) ||
    (row === 0 && column === last - 1) ||
    (row === last - 1 && column === 0)
  )
}

function drawAlignmentPattern(
  centerX: number,
  centerY: number,
  set: (x: number, y: number, dark: boolean) => void
): void {
  for (let y = -2; y <= 2; y++)
    for (let x = -2; x <= 2; x++)
      set(centerX + x, centerY + y, Math.max(Math.abs(x), Math.abs(y)) !== 1)
}

function selectBestMask(
  ecc: Ecc,
  modules: boolean[][],
  isFunction: boolean[][],
  size: number
): number {
  let bestMask = 0
  let minPenalty = Infinity
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask, modules, isFunction, size)
    drawFormatBits(ecc, mask, modules, isFunction, size, false)
    const penalty = computePenalty(modules, size)
    if (penalty < minPenalty) [bestMask, minPenalty] = [mask, penalty]
    applyMask(mask, modules, isFunction, size)
  }
  return bestMask
}

function getAlignmentPatternPositions(version: number): number[] {
  if (version === 1) return []
  const numAlign = Math.floor(version / 7) + 2
  const step =
    version === 32 ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2
  const result = [6]
  for (let pos = version * 4 + 10; result.length < numAlign; pos -= step)
    result.splice(1, 0, pos)
  return result
}

function drawFormatBits(
  ecc: Ecc,
  mask: number,
  modules: boolean[][],
  isFn: boolean[][],
  size: number,
  reserveOnly: boolean
): void {
  const data = (ECC_FORMAT_BITS[ecc] << 3) | mask
  let rem = data
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
  const bits = ((data << 10) | rem) ^ 0x5412

  const set = (x: number, y: number, i: number) => {
    modules[y][x] = reserveOnly ? false : ((bits >>> i) & 1) !== 0
    isFn[y][x] = true
  }

  // Top-left.
  for (let i = 0; i <= 5; i++) set(8, i, i)
  set(8, 7, 6)
  set(8, 8, 7)
  set(7, 8, 8)
  for (let i = 9; i < 15; i++) set(14 - i, 8, i)

  // Top-right + bottom-left.
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, i)
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, i)
  modules[size - 8][8] = reserveOnly ? false : true // always-dark module
  isFn[size - 8][8] = true
}

function drawVersion(
  version: number,
  modules: boolean[][],
  isFn: boolean[][],
  size: number
): void {
  if (version < 7) return
  let rem = version
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
  const bits = (version << 12) | rem

  for (let i = 0; i < 18; i++) {
    const bit = ((bits >>> i) & 1) !== 0
    const a = size - 11 + (i % 3)
    const b = Math.floor(i / 3)
    modules[a][b] = bit
    isFn[a][b] = true
    modules[b][a] = bit
    isFn[b][a] = true
  }
}

function drawCodewords(
  codewords: number[],
  modules: boolean[][],
  isFn: boolean[][],
  size: number
): void {
  let i = 0 // bit index into the codeword stream
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5 // skip the vertical timing column
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const upward = ((right + 1) & 2) === 0
        const y = upward ? size - 1 - vert : vert
        if (!isFn[y][x] && i < codewords.length * 8) {
          modules[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0
          i++
        }
      }
    }
  }
}

function applyMask(
  mask: number,
  modules: boolean[][],
  isFn: boolean[][],
  size: number
): void {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFn[y][x]) continue
      let invert = false
      switch (mask) {
        case 0:
          invert = (x + y) % 2 === 0
          break
        case 1:
          invert = y % 2 === 0
          break
        case 2:
          invert = x % 3 === 0
          break
        case 3:
          invert = (x + y) % 3 === 0
          break
        case 4:
          invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0
          break
        case 5:
          invert = ((x * y) % 2) + ((x * y) % 3) === 0
          break
        case 6:
          invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0
          break
        case 7:
          invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
          break
      }
      if (invert) modules[y][x] = !modules[y][x]
    }
  }
}

function computePenalty(modules: boolean[][], size: number): number {
  return (
    runPenalty(modules, size) +
    blockPenalty(modules, size) +
    finderPenalty(modules, size) +
    balancePenalty(modules, size)
  )
}

function runPenalty(modules: boolean[][], size: number): number {
  let penalty = 0
  for (let index = 0; index < size; index++) {
    penalty += lineRunPenalty(modules[index])
    penalty += lineRunPenalty(modules.map((row) => row[index]))
  }
  return penalty
}

function lineRunPenalty(cells: boolean[]): number {
  let penalty = 0
  let color = cells[0]
  let length = 1
  for (const cell of cells.slice(1)) {
    if (cell !== color) [color, length] = [cell, 1]
    else if (++length === 5) penalty += 3
    else if (length > 5) penalty++
  }
  return penalty
}

function blockPenalty(modules: boolean[][], size: number): number {
  let penalty = 0
  for (let y = 0; y < size - 1; y++)
    for (let x = 0; x < size - 1; x++) {
      const color = modules[y][x]
      if (
        color === modules[y][x + 1] &&
        color === modules[y + 1][x] &&
        color === modules[y + 1][x + 1]
      )
        penalty += 3
    }
  return penalty
}

const FINDER_PATTERNS = [
  [true, false, true, true, true, false, true, false, false, false, false],
  [false, false, false, false, true, false, true, true, true, false, true],
]

function finderPenalty(modules: boolean[][], size: number): number {
  let penalty = 0
  for (let index = 0; index < size; index++) {
    penalty += lineFinderPenalty(modules[index])
    penalty += lineFinderPenalty(modules.map((row) => row[index]))
  }
  return penalty
}

function lineFinderPenalty(cells: boolean[]): number {
  let penalty = 0
  for (let start = 0; start + 11 <= cells.length; start++) {
    if (
      FINDER_PATTERNS.some((pattern) =>
        pattern.every((value, offset) => cells[start + offset] === value)
      )
    )
      penalty += 40
  }
  return penalty
}

function balancePenalty(modules: boolean[][], size: number): number {
  const darkModules = modules.flat().filter(Boolean).length
  const ratio = (darkModules * 20) / (size * size)
  return (
    Math.min(
      Math.abs(Math.ceil(ratio) - 10),
      Math.abs(Math.floor(ratio) - 10)
    ) * 10
  )
}
