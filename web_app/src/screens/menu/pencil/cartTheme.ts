import { cartThemeFor, type CartTheme, type DesignProps } from '../designs'
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

/** Lists set wholly in Inter, by weight; their cart follows suit. */
const ALL_SANS_VARIANTS = new Set<PencilVariant>([
  'pencil-calm-spa',
  'pencil-auto-detail',
])
/**
 * Lists whose cart takes the list's own colours (`content.template`) rather
 * than the template's stock palette, so it reads as the same page.
 */
const LIST_COLOR_VARIANTS = new Set<PencilVariant>(['pencil-auto-detail'])

type ListTemplate = NonNullable<DesignProps['content']>['template']
const SANS = 'Inter, system-ui, sans-serif'

const isSolidHex = (value: string) => /^#[\da-f]{6}$/i.test(value)

export const hexLuminance = (value: string) => {
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

/**
 * Build cart tokens from the same visual config used by each Pencil list. For
 * `LIST_COLOR_VARIANTS` that includes the list's own colours on top.
 */
export function pencilCartThemeFor(
  variant: PencilVariant | 'pencil-journal',
  template?: ListTemplate
): CartTheme {
  if (variant === 'pencil-journal') return cartThemeFor('pencil-journal')
  const stock = PENCIL_TEMPLATE_CONFIG[variant]
  const ownColors = LIST_COLOR_VARIANTS.has(variant)
  const config = ownColors ? withListColors(stock, template) : stock
  // Auto Detail's stock ground is black, but a shop's list may bring a pale
  // one: judge the ground actually painted, or the cart turns black behind it.
  const isDark = ownColors
    ? hexLuminance(config.background) < 0.32
    : config.ink === '#FFFFFF' ||
      config.background === '#050505' ||
      variant === 'pencil-calm-spa'
  const sharp = CART_SHARP_VARIANTS.has(variant)
  const rounded = CART_ROUNDED_VARIANTS.has(variant)
  const radius = sharp ? '4px' : rounded ? '28px' : '14px'
  const controlRadius = sharp ? '2px' : rounded ? '16px' : '8px'
  // Calm Spa's cards are dark but its page is pale yellow: the cards' cream
  // ink laid straight on the page made the title and breadcrumb vanish.
  const pageInk =
    isDark && hexLuminance(config.background) > 0.5
      ? isSolidHex(config.darkPanel) && hexLuminance(config.darkPanel) < 0.32
        ? config.darkPanel
        : '#1A1A1A'
      : undefined
  const allSans = ALL_SANS_VARIANTS.has(variant)
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
    pageInk,
    pageMuted: pageInk && `${pageInk}B3`,
    footerBg,
    footerText: isDark ? '#D7D7D7' : config.muted,
    accent: config.accent,
    actionAccent: actionAccentFor(config),
    cardRadius: radius,
    controlRadius,
    buttonRadius: sharp ? '2px' : rounded ? '999px' : '8px',
    barRadius: sharp ? '0px' : rounded ? '24px' : '12px',
    bodyFamily: 'Inter, system-ui, sans-serif',
    // An all-Inter list shouldn't open onto a serif-and-mono cart.
    headingFamily: allSans ? SANS : '"Playfair Display", Georgia, serif',
    labelFamily: allSans ? SANS : '"IBM Plex Mono", "Courier New", monospace',
    headingTracking: sharp ? '0.02em' : '-0.03em',
    cardShadow: sharp
      ? '0 12px 30px -20px rgba(0,0,0,0.5)'
      : '0 18px 50px -20px rgba(15,13,26,0.30)',
  }
}

/** The colour half of the list's template overrides; copy stays with the list. */
function withListColors(
  config: PencilConfig,
  template: ListTemplate
): PencilConfig {
  if (!template) return config
  return {
    ...config,
    ...(template.backgroundColor ? { background: template.backgroundColor } : {}),
    ...(template.textColor ? { ink: template.textColor } : {}),
    ...(template.mutedColor ? { muted: template.mutedColor } : {}),
    ...(template.accentColor ? { accent: template.accentColor } : {}),
    ...(template.darkPanelColor ? { darkPanel: template.darkPanelColor } : {}),
  }
}
