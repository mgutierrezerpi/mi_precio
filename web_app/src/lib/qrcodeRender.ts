import { drawFunctionPatterns } from './qrcodeLayout'
import { applyMask } from './qrcodeMask'
import { computePenalty } from './qrcodePenalty'
import { ECC_FORMAT_BITS, type Ecc } from './qrcodeTables'

export function drawQr(version: number, ecc: Ecc, codewords: number[]): boolean[][] {
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

