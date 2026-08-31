import type { MagazineDesign } from '../../types'
import { DEFAULT_AQUA_PRODUCTS } from './templateDefaults'

export { DEFAULT_AQUA_PRODUCTS } from './templateDefaults'

export type MagazinePageContent = {
  schema_version?: number
  layout?: string
  eyebrow?: string
  headline?: string
  body?: string
  copy?: string
  quote?: string
  footer?: string
  images?: string[]
  imagePositions?: string[]
  products?: MagazineProductContent[]
}

export type MagazineProductContent = {
  name: string
  price: string
  description: string
}

export const DEFAULT_PANTRY_PRODUCTS: MagazineProductContent[] = [
  {
    name: 'Apricot & fennel jam',
    price: '11',
    description:
      'Sun-warmed fruit with a little aniseed lift. Beautiful with washed-rind cheese.',
  },
  {
    name: 'Olive oil crackers',
    price: '8',
    description: 'Thin, crisp and salted just enough. A clean, crunchy canvas.',
  },
  {
    name: 'Fermented chilli sauce',
    price: '13',
    description:
      'Slow heat, bright acidity, and a very good reason to go back for one more bite.',
  },
]

export const DEFAULT_HOT_SHELF_PRODUCTS: MagazineProductContent[] = [
  { name: 'CHILLI CRISP', price: '13', description: 'chilli crisp' },
  { name: 'ROASTED PEPPER', price: '11', description: 'roasted pepper spread' },
  { name: 'WHOLEGRAIN MUSTARD', price: '9', description: 'wholegrain mustard' },
]

export const DEFAULT_WILD_STEM_PRODUCTS: Record<
  string,
  MagazineProductContent[]
> = {
  'seasonal-stems': [
    {
      name: 'Parrot tulip',
      price: '$4 / stem',
      description: 'Ruffled, painterly and best in a loose handful.',
    },
    {
      name: 'Ranunculus',
      price: '$5 / stem',
      description: 'Layered petals, warm colour, endless optimism.',
    },
    {
      name: 'Sweet pea',
      price: '$4 / stem',
      description: 'Scented, delicate and worth leaning close for.',
    },
    {
      name: 'Allium',
      price: '$6 / stem',
      description: 'One globe makes the whole room feel considered.',
    },
  ],
  'flower-club': [
    {
      name: 'Four seasonal bunches each month.',
      price: '$96 / month',
      description: '',
    },
  ],
  'care-shelf': [
    { name: 'FLOWER FOOD', price: '$4', description: '' },
    { name: 'VASE CLEANER', price: '$9', description: '' },
    { name: 'FOLIAGE SPRAY', price: '$12', description: '' },
  ],
}

export const DEFAULT_MAGAZINE_PRODUCTS: Record<
  string,
  MagazineProductContent[]
> = {
  pantry: DEFAULT_PANTRY_PRODUCTS,
  'hot-shelf': DEFAULT_HOT_SHELF_PRODUCTS,
  ...DEFAULT_WILD_STEM_PRODUCTS,
  ...DEFAULT_AQUA_PRODUCTS,
}

export const MAGAZINE_TEMPLATES: {
  id: MagazineDesign
  nameKey: string
  descriptionKey: string
}[] = [
  {
    id: 'pencil-journal',
    nameKey: 'magazines.templatePencilJournal',
    descriptionKey: 'magazines.templatePencilJournalDescription',
  },
  {
    id: 'wild-stem',
    nameKey: 'magazines.templateWildStem',
    descriptionKey: 'magazines.templateWildStemDescription',
  },
  {
    id: 'aqua-objects',
    nameKey: 'magazines.templateAquaObjects',
    descriptionKey: 'magazines.templateAquaObjectsDescription',
  },
  {
    id: 'editorial',
    nameKey: 'magazines.templateEditorial',
    descriptionKey: 'magazines.templateEditorialDescription',
  },
  {
    id: 'catalog',
    nameKey: 'magazines.templateCatalog',
    descriptionKey: 'magazines.templateCatalogDescription',
  },
]

export function pageCopy(content: Record<string, unknown> | null): string {
  const copy = content?.copy
  return typeof copy === 'string' ? copy : ''
}

export function pageContent(
  content: Record<string, unknown> | null
): MagazinePageContent {
  if (!content) return {}
  return content as MagazinePageContent
}
