import type { ListDesign } from '../../../types'

export type PencilVariant =
  | 'pencil-bakery'
  | 'pencil-garden'
  | 'pencil-market'
  | 'pencil-evening'
  | 'pencil-workshop'
  | 'pencil-cheese'
  | 'pencil-flower'
  | 'pencil-flower-summer'
  | 'pencil-flower-winter'
  | 'pencil-flower-spring'
  | 'pencil-wine'
  | 'pencil-cheese-alternating'
  | 'pencil-hardware-alternating'
  | 'pencil-hardware-weekend'
  | 'pencil-hardware-shelf'
  | 'pencil-casa-ritual'
  | 'pencil-casa-bath'
  | 'pencil-casa-signature'
  | 'pencil-casa-services'
  | 'pencil-auto-detail'
  | 'pencil-blush-bloom'
  | 'pencil-nova'
  | 'pencil-beardy'
  | 'pencil-calm-spa'
  | 'pencil-union-barber'
  | 'pencil-studio-mono'
  | 'pencil-beauty-issue'
  | 'pencil-obsidian-quarterly'
  | 'pencil-cafecitos'

const VARIANTS = new Set<PencilVariant>([
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
])

export function isPencilVariant(design: ListDesign): design is PencilVariant {
  return VARIANTS.has(design as PencilVariant)
}
