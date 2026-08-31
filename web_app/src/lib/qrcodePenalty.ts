export function computePenalty(modules: boolean[][], size: number): number {
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

