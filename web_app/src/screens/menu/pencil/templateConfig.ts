import type { PencilConfig } from './index'

export const pencilImages = {
  bakery:
    'https://images.unsplash.com/photo-1753826366896-170e04691b1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  garden:
    'https://images.unsplash.com/photo-1726950189914-8fe1016eb9c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  market:
    'https://images.unsplash.com/photo-1693140539040-aa567b436278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  evening:
    'https://images.unsplash.com/photo-1779282620211-810663eac20e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  workshop:
    'https://images.unsplash.com/photo-1695728130932-7b5967d59f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
}


export const definePencilTemplate = (config: PencilConfig): PencilConfig => config

const SPECIAL_BASE: PencilConfig = {
  background: '#F5F1E8',
  ink: '#24231F',
  muted: '#6E6A61',
  accent: '#A98D68',
  darkPanel: '#1B1D1B',
  image: pencilImages.workshop,
  imageLabel: 'FEATURED',
  imageTitle: 'the good things',
  promoEyebrow: 'THIS WEEK',
  promoTitle: 'A considered collection',
  promoBody: 'Thoughtful details, made for a slower and better day.',
  promoPrice: '$48',
  promoNote: 'available now',
  footerLeft: 'OPEN DAILY · BY APPOINTMENT',
  footerRight: 'ASK US ABOUT THE DETAILS',
  layout: 'alternating',
}

export const defineSpecialTemplate = (overrides: Partial<PencilConfig>): PencilConfig => ({
  ...SPECIAL_BASE,
  ...overrides,
})

