import type { LinkTreeLink } from '../../../types'

export const EMPTY_LINK: LinkTreeLink = {
  id: null,
  title: 'Nuevo link',
  description: null,
  url: '',
  icon: 'link',
  style: 'light',
  enabled: true,
}

export const inputClass =
  'mt-1 h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-sm text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)] focus:ring-2 focus:ring-[var(--dash-link)]/20'
export const textareaClass = `${inputClass} h-auto min-h-24 py-2.5`

function toHex(value: number) {
  return Math.round(value).toString(16).padStart(2, '0')
}

export async function colorsFromLogo(src: string) {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('logo image could not load'))
    image.src = src
  })
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 72
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('canvas unavailable')
  context.drawImage(image, 0, 0, 72, 72)
  const buckets = new Map<
    string,
    { count: number; r: number; g: number; b: number }
  >()
  const pixels = context.getImageData(0, 0, 72, 72).data
  for (let index = 0; index < pixels.length; index += 16) {
    const [r, g, b, alpha] = [
      pixels[index],
      pixels[index + 1],
      pixels[index + 2],
      pixels[index + 3],
    ]
    const high = Math.max(r, g, b)
    const low = Math.min(r, g, b)
    if (alpha < 180 || high < 45 || high > 238 || high - low < 28) continue
    const key = `${Math.round(r / 32)}-${Math.round(g / 32)}-${Math.round(b / 32)}`
    const bucket = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 }
    bucket.count += 1
    bucket.r += r
    bucket.g += g
    bucket.b += b
    buckets.set(key, bucket)
  }
  const winner = [...buckets.values()].sort((a, b) => b.count - a.count)[0]
  if (!winner) throw new Error('no usable logo colour')
  const colour = {
    r: winner.r / winner.count,
    g: winner.g / winner.count,
    b: winner.b / winner.count,
  }
  const accent =
    `#${toHex(colour.r)}${toHex(colour.g)}${toHex(colour.b)}`.toUpperCase()
  const background =
    `#${toHex(255 - (255 - colour.r) * 0.1)}${toHex(255 - (255 - colour.g) * 0.1)}${toHex(255 - (255 - colour.b) * 0.1)}`.toUpperCase()
  return { accent, background }
}
