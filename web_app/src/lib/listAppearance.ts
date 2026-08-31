import type { ListDesign } from '../types'

/** Public list templates. Keep in sync with the API appearance input model. */
export const LIST_DESIGNS: ListDesign[] = [
  'store',
  'classic',
  'nordic',
  'fine',
  'modern',
  'photo',
  'cards',
  'catalog',
  'tech',
  'pencil-bakery',
  'pencil-garden',
  'pencil-market',
  'pencil-evening',
  'pencil-workshop',
  'pencil-cheese',
  'pencil-flower',
  'pencil-flower-summer',
  'pencil-flower-winter',
  'pencil-flower-spring',
  'pencil-wine',
  'pencil-cheese-alternating',
  'pencil-hardware-alternating',
  'pencil-hardware-weekend',
  'pencil-hardware-shelf',
  'pencil-casa-ritual',
  'pencil-casa-bath',
  'pencil-casa-signature',
  'pencil-casa-services',
  'pencil-auto-detail',
  'pencil-blush-bloom',
  'pencil-nova',
  'pencil-beardy',
  'pencil-calm-spa',
  'pencil-union-barber',
  'pencil-studio-mono',
  'pencil-beauty-issue',
  'pencil-obsidian-quarterly',
  'pencil-cafecitos',
]

export const BRAND_SWATCHES = [
  '#7C3AED',
  '#2563EB',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#DB2777',
  '#475569',
]

export type ListAppearance = {
  design: ListDesign | null
  heroColor: string | null
  bgUrl: string | null
  bgOverlay: boolean | null
}

export function hasOwnAppearance(
  appearance: Pick<ListAppearance, 'design' | 'heroColor' | 'bgUrl'>
): boolean {
  return Boolean(appearance.design || appearance.heroColor || appearance.bgUrl)
}
