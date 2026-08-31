export function applyMask(
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
