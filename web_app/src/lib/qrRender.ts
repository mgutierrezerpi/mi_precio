import { generateQrMatrix, type Ecc } from './qrcode'

export interface QrRenderOptions {
  fg?: string
  bg?: string
  ecc?: Ecc
  margin?: number // quiet zone, in modules
  logoUrl?: string | null // image drawn at the center (uses high ECC to stay scannable)
}

const DEFAULTS = { fg: '#0F172A', bg: '#FFFFFF', margin: 4 }

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/** Draws a crisp QR onto a canvas at the given pixel size. Returns a promise that
 *  resolves once an optional center logo has finished loading and been painted. */
export async function drawQrToCanvas(canvas: HTMLCanvasElement, value: string, size: number, opts: QrRenderOptions = {}): Promise<void> {
  const fg = opts.fg ?? DEFAULTS.fg
  const bg = opts.bg ?? DEFAULTS.bg
  const margin = opts.margin ?? DEFAULTS.margin
  const ecc: Ecc = opts.ecc ?? (opts.logoUrl ? 'H' : 'M')

  const modules = generateQrMatrix(value, ecc)
  const count = modules.length
  const total = count + margin * 2
  const scale = Math.floor(size / total) || 1
  const px = scale * total

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  canvas.width = px * dpr
  canvas.height = px * dpr
  canvas.style.width = `${px}px`
  canvas.style.height = `${px}px`

  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, px, px)

  ctx.fillStyle = fg
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      if (modules[y][x]) ctx.fillRect((x + margin) * scale, (y + margin) * scale, scale, scale)
    }
  }

  if (opts.logoUrl) {
    try {
      const img = await loadImage(opts.logoUrl)
      const logoSize = Math.round(px * 0.22)
      const pad = Math.round(logoSize * 0.16)
      const box = logoSize + pad * 2
      const x = (px - box) / 2
      const y = (px - box) / 2
      roundRect(ctx, x, y, box, box, Math.round(box * 0.22))
      ctx.fillStyle = bg
      ctx.fill()
      ctx.drawImage(img, x + pad, y + pad, logoSize, logoSize)
    } catch {
      // If the logo fails to load, the plain (still scannable) QR remains.
    }
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Builds an SVG string for the QR (vector, ideal for printing). */
export function qrToSvg(value: string, opts: QrRenderOptions = {}): string {
  const fg = opts.fg ?? DEFAULTS.fg
  const bg = opts.bg ?? DEFAULTS.bg
  const margin = opts.margin ?? DEFAULTS.margin
  const ecc: Ecc = opts.ecc ?? 'M'
  const modules = generateQrMatrix(value, ecc)
  const count = modules.length
  const total = count + margin * 2

  let path = ''
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      if (modules[y][x]) path += `M${x + margin},${y + margin}h1v1h-1z`
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="${bg}"/><path d="${path}" fill="${fg}"/></svg>`
}

function triggerDownload(href: string, filename: string): void {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** Renders the QR offscreen and downloads it as a PNG. */
export async function downloadQrPng(value: string, filename: string, opts: QrRenderOptions = {}, size = 1024): Promise<void> {
  const canvas = document.createElement('canvas')
  await drawQrToCanvas(canvas, value, size, opts)
  triggerDownload(canvas.toDataURL('image/png'), filename)
}

/** Downloads the QR as a vector SVG (logo not embedded). */
export function downloadQrSvg(value: string, filename: string, opts: QrRenderOptions = {}): void {
  const svg = qrToSvg(value, opts)
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  triggerDownload(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
