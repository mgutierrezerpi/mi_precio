import type { TFn } from './i18n'

/** The hero figures of a list whose owner did not write their own.
 *
 *  Only facts: this page is published in the shop's name, so a promise the shop
 *  never made («24/7») or a channel it never set up cannot appear here. */
export function defaultHeroStats({
  productCount,
  whatsapp,
  updated,
  t,
}: {
  productCount: number
  whatsapp: string | null
  updated: string
  t: TFn
}): [string, string][] {
  return [
    [String(productCount), t('store.statProducts')],
    ...(whatsapp
      ? ([[whatsapp, t('store.statShipping')]] as [string, string][])
      : []),
    [updated, t('store.statUpdated')],
  ]
}
