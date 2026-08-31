import {
  ECC_CODEWORDS_PER_BLOCK,
  ECC_INDEX,
  MAX_VERSION,
  MIN_VERSION,
  NUM_ERROR_CORRECTION_BLOCKS,
  type Ecc,
} from './qrcodeTables'
import { addEccAndInterleave } from './qrcodeReedSolomon'
import { drawQr } from './qrcodeRender'

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
