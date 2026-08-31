import type { ReactNode } from 'react'
import type { Item } from '../../types'
import type { MagazinePageContent } from '../../components/magazine/templateCatalog'

export const SERIF = '"Playfair Display", Georgia, serif'
export const MONO = '"IBM Plex Mono", "Courier New", monospace'
export const SANS = 'Inter, system-ui, sans-serif'

export const COLORS = {
  paper: '#F7F2EA', cream: '#F3EDE2', pantry: '#FAF5EC',
  history: '#EEE5D7', ink: '#3A2A1D', body: '#70583F',
  rust: '#A76D3E', orange: '#E75B39', dark: '#3A2A1D', pale: '#D6B58B',
}

export const IMAGES = {
  cover: '/pencil/cheese-factory/zLZId.png',
  board: '/pencil/cheese-factory/xnu2M.png',
  producer: '/pencil/cheese-factory/z9oXs.png',
  chilli: '/pencil/cheese-factory/BHUpJ.png',
  recipe: '/pencil/cheese-factory/bkM10.png',
  history: '/pencil/cheese-factory/fsiu6.png',
  table: '/pencil/cheese-factory/kofq2.png',
  gruyere: '/pencil/cheese-factory/WeIY4.png',
  figs: '/pencil/cheese-factory/E8p4K.png',
  jam: 'https://images.unsplash.com/photo-1785605121107-677f10a463f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  crackers: 'https://images.unsplash.com/photo-1657299156528-2d50a9a6a444?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  sauce: 'https://images.unsplash.com/photo-1757800499069-ace8d0d31ce8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  pepper: 'https://images.unsplash.com/photo-1698557048177-a460bb415177?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  mustard: 'https://images.unsplash.com/photo-1706111584143-4f41b25d1db7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
}

export type MagazineItem = Pick<Item, 'id' | 'name' | 'price' | 'description'>
export type MagazineEditField =
  | 'eyebrow' | 'headline' | 'body' | 'quote' | 'footer'
  | 'productName' | 'productDescription' | 'productPrice' | 'image'
export type MagazineEditSelection = {
  field: MagazineEditField
  imageIndex?: number
  textIndex?: number
  productIndex?: number
}
export type JournalPage = { label: string; node: ReactNode }

export const fallback = (name: string, price: string, description: string): MagazineItem => ({
  id: name, name, price, description,
})
export const amount = (item: MagazineItem) => {
  const value = Number.parseFloat(item.price)
  return Number.isNaN(value) ? `$${item.price}` : `$${value.toFixed(2).replace(/\.00$/, '')}`
}
export function imagePosition(content: MagazinePageContent | undefined, index: number) {
  return content?.imagePositions?.[index] || 'center'
}
