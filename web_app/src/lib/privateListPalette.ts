import { darken, lighten, readableOn, withAlpha } from './designColors'

/** Same fallback as the public list, so the gate matches what is behind it. */
const DEFAULT_ACCENT = '#7C3AED'

/** Colors of the access-code screen, derived from the shop's brand color.
 *
 *  The card is white whatever the brand is, so anything written on it uses a
 *  darkened accent: a yellow or lime brand would be unreadable as text. */
export function privateListPalette(brandColor?: string | null) {
  const accent = brandColor || DEFAULT_ACCENT
  const onAccent = readableOn(accent)
  const ink = darken(accent, onAccent === '#FFFFFF' ? 0.25 : 0.6)
  return {
    accent,
    onAccent,
    ink,
    pressed: darken(accent, 0.25),
    fieldBg: lighten(accent, 0.94),
    fieldBorder: withAlpha(ink, 0.45),
    focusRing: withAlpha(ink, 0.18),
  }
}
