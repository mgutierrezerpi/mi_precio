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
]

/**
 * Designs no longer offered in the picker. They stay in `LIST_DESIGNS` and
 * valid on the API, so a list already using one keeps rendering exactly as
 * before — hiding is about what new choices look like, not about breaking
 * anyone's live page. Of the four "Maison Étoile" editions only "Diario"
 * (`pencil-bakery`) is kept on offer.
 */
export const HIDDEN_LIST_DESIGNS: ReadonlySet<ListDesign> = new Set([
  'pencil-garden',
  'pencil-market',
  'pencil-evening',
])

/**
 * What the picker lists: every design minus the hidden ones — except the one
 * already in use, so a shop on a retired design still sees its selection.
 */
export function pickableListDesigns(current: ListDesign | null): ListDesign[] {
  return LIST_DESIGNS.filter(
    (design) => !HIDDEN_LIST_DESIGNS.has(design) || design === current
  )
}

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
