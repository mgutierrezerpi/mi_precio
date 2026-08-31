export const DEFAULT_PAGE_SIZE = 8
export const PAGE_SIZE_OPTIONS = [8, 16, 32, 64] as const
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]
const PAGE_SIZE_STORAGE_KEY = 'mi_precio:products-page-size'

export function pageSizeStorageKey(tenantId: string) {
  return `${PAGE_SIZE_STORAGE_KEY}:${tenantId}`
}

export function isPageSize(value: number): value is PageSize {
  return PAGE_SIZE_OPTIONS.includes(value as PageSize)
}

export function readPageSize(tenantId: string | undefined): PageSize {
  if (!tenantId || typeof window === 'undefined') return DEFAULT_PAGE_SIZE
  try {
    const stored = Number(window.localStorage.getItem(pageSizeStorageKey(tenantId)))
    return isPageSize(stored) ? stored : DEFAULT_PAGE_SIZE
  } catch {
    return DEFAULT_PAGE_SIZE
  }
}

export function savePageSize(tenantId: string, pageSize: PageSize) {
  try {
    window.localStorage.setItem(pageSizeStorageKey(tenantId), String(pageSize))
  } catch {
    // Storage can be unavailable in private browsing; pagination still works.
  }
}

/** Backend timestamps are naive UTC; convert them to the browser's local time. */
export function parseUtcDate(value: string) {
  const hasTimezone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(value)
  return new Date(hasTimezone ? value : `${value}Z`)
}

/** Read an image file, downscale it, and return a compressed WebP blob. */
export async function fileToImageBlob(file: File, max = 1600): Promise<Blob> {
  const src = await new Promise<string>((res, rej) => {
    const reader = new FileReader()
    reader.onload = () => res(reader.result as string)
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const image = new Image()
    image.onload = () => res(image)
    image.onerror = rej
    image.src = src
  })
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.width * scale))
  canvas.height = Math.max(1, Math.round(img.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return await new Promise<Blob>((res, rej) => {
    canvas.toBlob(
      (blob) => (blob ? res(blob) : rej(new Error('No se pudo procesar la imagen.'))),
      'image/webp',
      0.82
    )
  })
}
