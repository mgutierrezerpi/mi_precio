import type { MagazineProductContent } from './templateCatalog'

export const DEFAULT_AQUA_PRODUCTS: Record<
  string,
  MagazineProductContent[]
> = {
  'aqua-monolith': [
    { name: 'MATERIAL', price: 'MINERAL COMPOSITE', description: '' },
    { name: 'LENGTH', price: '1680 MM', description: '' },
    { name: 'FINISH', price: 'MATTE IVORY', description: '' },
  ],
  'aqua-fittings': [
    { name: 'WALL MIXER', price: 'BRUSHED NICKEL · $420', description: '' },
    { name: 'BASIN SPOUT', price: 'SATIN BRASS · $365', description: '' },
    { name: 'RAIN HEAD', price: 'GUNMETAL · $560', description: '' },
  ],
  'aqua-field-notes': [
    {
      name: 'STONE THAT HOLDS THE LIGHT',
      price: 'THE PALE ROOM',
      description:
        'A limestone basin, softened edges and a morning ritual that starts quietly.',
    },
    {
      name: 'WHY WARM METAL IS BACK',
      price: 'THE BRASS ROOM',
      description:
        'The soft return of burnished brass — and the language of ageing a room.',
    },
    {
      name: 'A SHOWER WITH A VIEW',
      price: 'THE STEAM ROOM',
      description:
        'Glass, fog and a deep sill for the objects you reach for every day.',
    },
  ],
  'aqua-sources': [
    {
      name: 'TRAVERTINE',
      price: 'TIVOLI, ITALY',
      description:
        'Quarried near the springs east of Rome. Its open grain and warm mineral tone make every cut unique.',
    },
    {
      name: 'BRASS',
      price: 'BIRMINGHAM, UK',
      description:
        'Precision-cast, then hand-finished. Left unlacquered, it gathers a softer, lived-in patina.',
    },
    {
      name: 'PORCELAIN',
      price: 'LIMOGES, FRANCE',
      description:
        'Fired at high temperature for a dense, non-porous surface that stays luminous for decades.',
    },
  ],
  'aqua-coupons': [
    {
      name: '10% OFF YOUR FIRST TAPWARE SET',
      price: 'AQUA10',
      description: 'Valid on basin, bath and shower fittings.',
    },
    {
      name: 'COMPLIMENTARY DELIVERY ON BATHS',
      price: 'STILLWATER',
      description: 'For freestanding baths delivered within the city.',
    },
    {
      name: '$250 DESIGN CREDIT',
      price: 'OBJECTS250',
      description: 'Applied to projects over $3,000. Consultation included.',
    },
  ],
}
