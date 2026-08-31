import {
  ECC_CODEWORDS_PER_BLOCK,
  ECC_INDEX,
  NUM_ERROR_CORRECTION_BLOCKS,
  type Ecc,
} from './qrcodeTables'

function getNumRawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2
    result -= (25 * numAlign - 10) * numAlign - 55
    if (version >= 7) result -= 36
  }
  return result
}

export function addEccAndInterleave(
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
