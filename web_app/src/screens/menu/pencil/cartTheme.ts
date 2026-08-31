import { cartThemeFor, type CartTheme } from '../designs'
import { PENCIL_TEMPLATE_CONFIG } from './templates'
import type { PencilConfig } from './index'
import type { PencilVariant } from './variants'

const CART_SHARP_VARIANTS = new Set<PencilVariant>([
  'pencil-casa-ritual',
  'pencil-casa-bath',
  'pencil-casa-signature',
  'pencil-casa-services',
  'pencil-auto-detail',
  'pencil-blush-bloom',
  'pencil-beardy',
  'pencil-union-barber',
  'pencil-studio-mono',
  'pencil-obsidian-quarterly',
])
const CART_ROUNDED_VARIANTS = new Set<PencilVariant>([
  'pencil-nova',
  'pencil-calm-spa',
])

const isSolidHex = (value: string) => /^#[\da-f]{6}$/i.test(value)

const hexLuminance = (value: string) => {
  if (!isSolidHex(value)) return 1
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255
  )
  const linear = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  )
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

const actionAccentFor = (config: PencilConfig) => {
  if (hexLuminance(config.accent) < 0.62) return config.accent
  if (isSolidHex(config.darkPanel) && hexLuminance(config.darkPanel) < 0.32)
    return config.darkPanel
  if (hexLuminance(config.background) < 0.32) return config.background
  return config.ink
}

/** Build cart tokens from the same visual config used by each Pencil list. */
export function pencilCartThemeFor(
  variant: PencilVariant | 'pencil-journal'
): CartTheme {
  if (variant === 'pencil-journal') return cartThemeFor('pencil-journal')
  const config = PENCIL_TEMPLATE_CONFIG[variant]
  const isDark =
    config.ink === '#FFFFFF' ||
    config.background === '#050505' ||
    variant === 'pencil-calm-spa' ||
    variant === 'pencil-auto-detail'
  const sharp = CART_SHARP_VARIANTS.has(variant)
  const rounded = CART_ROUNDED_VARIANTS.has(variant)
  const radius = sharp ? '4px' : rounded ? '28px' : '14px'
  const controlRadius = sharp ? '2px' : rounded ? '16px' : '8px'
  const footerBg = config.darkPanel.startsWith('#')
    ? config.darkPanel
    : isDark
      ? '#111111'
      : '#1B1B1B'
  return {
    ...cartThemeFor('pencil-journal'),
    isDark,
    bg: config.background,
    surface: isDark ? '#111111' : config.background,
    field: isDark ? '#1A1A1A' : '#FFFFFF',
    divider: `${config.accent}33`,
    line: `${config.accent}88`,
    ink: config.ink,
    body: config.muted,
    muted: config.muted,
    footerBg,
    footerText: isDark ? '#D7D7D7' : config.muted,
    accent: config.accent,
    actionAccent: actionAccentFor(config),
    cardRadius: radius,
    controlRadius,
    buttonRadius: sharp ? '2px' : rounded ? '999px' : '8px',
    barRadius: sharp ? '0px' : rounded ? '24px' : '12px',
    bodyFamily: 'Inter, system-ui, sans-serif',
    headingFamily: '"Playfair Display", Georgia, serif',
    labelFamily: '"IBM Plex Mono", "Courier New", monospace',
    headingTracking: sharp ? '0.02em' : '-0.03em',
    cardShadow: sharp
      ? '0 12px 30px -20px rgba(0,0,0,0.5)'
      : '0 18px 50px -20px rgba(15,13,26,0.30)',
  }
}
