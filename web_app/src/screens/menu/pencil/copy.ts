/**
 * Plain helpers every Pencil layout shares. Kept apart from the components in
 * `shared.tsx` so both files stay fast-refresh friendly.
 */
import type { DesignProps } from '../designs'

export const pencilPrice = (value: string | number, prefix = '$') => {
  const amount = typeof value === 'number' ? value : Number.parseFloat(value)
  if (Number.isNaN(amount)) return '$—'
  const display = amount.toFixed(2).replace(/\.00$/, '')
  return prefix === '$' ? `$${display}` : `${prefix} ${display}`
}

/**
 * The shop's own words win. With nothing authored we show the shop's real
 * details — never the sample address the template shipped with, which put a
 * street in Paris on the page of a café in Montevideo.
 */
export function footerLines(
  config: { footerLeft: string; footerRight: string },
  props: DesignProps
) {
  return {
    left: config.footerLeft || props.tenant.address || props.tenant.name,
    right:
      config.footerRight || props.t('pub.footer', { currency: props.currency }),
  }
}

/**
 * The heading a template shows when the list has no hero of its own: the
 * list's name, under the shop's, over the shop's description. Every template
 * used to fall back to its own sample copy instead — "PRICE LIST",
 * "THE CALM SPA", "CAR DETAILING" — so a café that never wrote a hero opened on
 * another business's name, in English.
 */
export function heroCopy(props: DesignProps) {
  const hero = props.content?.hero
  return {
    eyebrow: hero?.eyebrow || props.tenant.name,
    title: hero?.title || props.listName || props.tenant.name,
    body: hero?.body || props.tenant.description || undefined,
  }
}
