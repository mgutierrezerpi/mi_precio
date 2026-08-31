export function drawFunctionPatterns(
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
