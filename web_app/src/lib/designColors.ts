function hexDigits(hex: string): string {
  const value = hex.replace('#', '')
  return value.length === 3
    ? value
        .split('')
        .map((channel) => channel + channel)
        .join('')
    : value.padEnd(6, '0').slice(0, 6)
}

function toHex(channels: number[]): string {
  return `#${channels
    .map((channel) => Math.min(255, Math.max(0, Math.round(channel))))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`
}

export function lighten(hex: string, amount = 0.4): string {
  const value = hexDigits(hex)
  const channel = (index: number) => {
    const current = Number.parseInt(value.slice(index, index + 2), 16)
    return current + (255 - current) * amount
  }
  return toHex([channel(0), channel(2), channel(4)])
}

export function darken(hex: string, amount = 0.4): string {
  const value = hexDigits(hex)
  const channel = (index: number) =>
    Number.parseInt(value.slice(index, index + 2), 16) * (1 - amount)
  return toHex([channel(0), channel(2), channel(4)])
}

export function withAlpha(hex: string, alpha: number): string {
  const value = hexDigits(hex)
  return `#${value}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`
}

export function readableOn(hex: string): string {
  const value = hexDigits(hex)
  const [red, green, blue] = [0, 2, 4].map((index) =>
    Number.parseInt(value.slice(index, index + 2), 16)
  )
  return (0.299 * red + 0.587 * green + 0.114 * blue) / 255 > 0.62
    ? '#141414'
    : '#FFFFFF'
}
