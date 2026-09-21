import { useEffect, useState } from 'react'

/**
 * Whether a logo is drawn in light ink on a transparent ground — made for dark
 * backgrounds. Such a logo put on the usual white tile mostly disappears: Café
 * Aurora's is 69% transparent and 58% of what remains is near-white, so on
 * white only its small cup survives, lost in a corner of the tile.
 *
 * Reads RGBA pixels. Anything that is not clearly light-on-transparent is
 * `other`, which keeps the white tile — the safe default for dark ink.
 */
export function classifyLogoInk(rgba: ArrayLike<number>): 'light' | 'other' {
  let transparent = 0
  let opaque = 0
  let light = 0
  let dark = 0
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    if (rgba[i + 3] < 20) {
      transparent++
      continue
    }
    opaque++
    const lum =
      (0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]) / 255
    if (lum > 0.8) light++
    else if (lum < 0.35) dark++
  }
  const total = transparent + opaque
  if (!total || !opaque) return 'other'
  const seeThrough = transparent / total >= 0.2
  const mostlyLight = light / opaque >= 0.5 && dark / opaque <= 0.4
  return seeThrough && mostlyLight ? 'light' : 'other'
}

const SAMPLE_WIDTH = 128

/**
 * `classifyLogoInk` for a logo URL, sampled on a small canvas. `null` while it
 * loads; `other` when the image cannot be read (a cross-origin host without
 * CORS taints the canvas), so an unreadable logo keeps the white tile.
 */
export function useLogoInk(url?: string | null): 'light' | 'other' | null {
  const [ink, setInk] = useState<'light' | 'other' | null>(null)

  useEffect(() => {
    if (!url) return
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      try {
        const scale = Math.min(1, SAMPLE_WIDTH / (img.naturalWidth || 1))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
        const context = canvas.getContext('2d')
        if (!context) return setInk('other')
        context.drawImage(img, 0, 0, canvas.width, canvas.height)
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
        setInk(classifyLogoInk(data))
      } catch {
        setInk('other')
      }
    }
    img.onerror = () => {
      if (!cancelled) setInk('other')
    }
    img.src = url
    return () => {
      cancelled = true
    }
  }, [url])

  return url ? ink : null
}
