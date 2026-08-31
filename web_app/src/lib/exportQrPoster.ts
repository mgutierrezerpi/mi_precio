import {
  BRAND_LOGO_PATH,
  POSTER_H,
  POSTER_W,
  buildQrPosterSvg,
  type QrPosterOptions,
} from './qrPosterSvg'

/** 2× the poster's 150dpi authoring size, so the PNG prints at 300dpi. */
const PNG_SCALE = 2

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** Loads the MiPrecio mark and inlines it as a PNG data URL.
 *
 *  Inlined because neither export can reach out for it later: an SVG saved to
 *  disk with a remote `href` shows a broken logo on any machine that cannot
 *  fetch it, and an SVG rasterised through an `<img>` is not allowed to load
 *  external resources at all — the mark would silently vanish from the PNG.
 *
 *  Re-encoded to PNG because the asset ships as WebP, which a print shop's
 *  software may well refuse to open inside an SVG. Returns null on failure,
 *  which falls the poster back to the wordmark drawn as text. */
async function loadBrandMark(): Promise<{
  dataUrl: string
  aspect: number
} | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = BRAND_LOGO_PATH
    })
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    canvas.getContext('2d')!.drawImage(img, 0, 0)
    return {
      dataUrl: canvas.toDataURL('image/png'),
      aspect: img.naturalWidth / img.naturalHeight,
    }
  } catch {
    return null
  }
}

export type PosterRequest = Omit<
  QrPosterOptions,
  'logoDataUrl' | 'logoAspect'
> & {
  /** Base name for the downloaded file, without extension. */
  fileName: string
}

async function posterSvg(request: PosterRequest): Promise<string> {
  const mark = await loadBrandMark()
  return buildQrPosterSvg({
    ...request,
    logoDataUrl: mark?.dataUrl,
    logoAspect: mark?.aspect,
  })
}

/** Downloads the poster as a vector SVG: scalable to any size a print shop
 *  wants, and editable if they need to nudge a colour. */
export async function downloadQrPosterSvg(request: PosterRequest) {
  const svg = await posterSvg(request)
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  triggerDownload(url, `${request.fileName}.svg`)
  URL.revokeObjectURL(url)
}

/** Downloads the poster as a PNG, rasterised from that same vector.
 *
 *  Rasterising the SVG rather than capturing the DOM keeps one source of truth
 *  for the design, and lets the sheet come out at whatever density we ask for
 *  instead of whatever the screen happens to be. */
export async function downloadQrPosterPng(request: PosterRequest) {
  const svg = await posterSvg(request)
  const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = source
  })

  const canvas = document.createElement('canvas')
  canvas.width = POSTER_W * PNG_SCALE
  canvas.height = POSTER_H * PNG_SCALE
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  triggerDownload(canvas.toDataURL('image/png'), `${request.fileName}.png`)
}
