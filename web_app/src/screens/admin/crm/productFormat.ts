import type { Product } from '../../../types'
import type { Tone } from './theme'
import type { IconName } from './ui'

/* Shared formatting helpers for product rows (dashboard + products screen). */

// Keys are matched case-insensitively (see lookups below).
const CAT_TONE: Record<string, Tone> = {
  ferretería: 'violet', ferreteria: 'violet', eléctricos: 'sky', electricos: 'sky',
  pinturas: 'rose', construcción: 'slate', construccion: 'slate', herramientas: 'purple',
  lavadero: 'sky', limpieza: 'sky',
}
const CAT_ICON: Record<string, IconName> = {
  ferretería: 'wrench', ferreteria: 'wrench', eléctricos: 'zap', electricos: 'zap',
  pinturas: 'paintbrush', construcción: 'layers', construccion: 'layers', herramientas: 'cog',
  lavadero: 'droplets', limpieza: 'droplets',
}
const TONE_POOL: Tone[] = ['violet', 'sky', 'blue', 'green', 'amber', 'rose', 'purple']

export function catTone(cat?: string | null): Tone {
  if (!cat) return 'slate'
  const hit = CAT_TONE[cat.trim().toLowerCase()]
  if (hit) return hit
  let h = 0
  for (const ch of cat) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return TONE_POOL[h % TONE_POOL.length]
}

export const catIcon = (cat?: string | null): IconName => (cat && CAT_ICON[cat.trim().toLowerCase()]) || 'box'

/** Category shown with its first letter capitalized, regardless of how it was typed. */
export function displayCategory(cat?: string | null): string {
  const c = cat?.trim()
  return c ? c.charAt(0).toUpperCase() + c.slice(1) : ''
}

/** Canonical form stored on save: trimmed, first letter upper, rest lower (collapses casing variants). */
export function normalizeCategory(cat?: string | null): string | null {
  const c = cat?.trim().replace(/\s+/g, ' ')
  return c ? c.charAt(0).toUpperCase() + c.slice(1).toLowerCase() : null
}

export function formatPrice(price: string): string {
  const n = parseFloat(price)
  if (Number.isNaN(n)) return price
  return '$ ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n)
}

export function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'Recién'
  const m = s / 60
  if (m < 60) return `Hace ${Math.floor(m)} min`
  const h = m / 60
  if (h < 24) return `Hace ${Math.floor(h)} h`
  const d = h / 24
  if (d < 2) return 'Ayer'
  return `Hace ${Math.floor(d)} días`
}

export type AvailKey = 'available' | 'unavailable'
export const availKey = (p: Product): AvailKey => (p.available ? 'available' : 'unavailable')
export const STOCK_LABEL: Record<AvailKey, string> = { available: 'Disponible', unavailable: 'No disponible' }
export const STOCK_TONE: Record<AvailKey, Tone> = { available: 'green', unavailable: 'red' }
