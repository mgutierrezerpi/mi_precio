import type { CSSProperties, ReactNode } from 'react'
import type { MagazineItem } from './pencilJournalTheme'
import { COLORS, MONO, amount } from './pencilJournalTheme'

export function Page({ background, children, className = '' }: {
  background: string; children: ReactNode; className?: string
}) {
  return <section className={`mx-auto min-h-[900px] w-full max-w-[700px] overflow-hidden ${className}`} style={{ background, color: COLORS.ink }}>{children}</section>
}
export function PageInner({ children, className = '', style }: {
  children: ReactNode; className?: string; style?: CSSProperties
}) {
  return <div className={`px-6 py-10 sm:px-[46px] ${className}`} style={style}>{children}</div>
}
export function Folio({ children, color = COLORS.rust, field }: {
  children: ReactNode; color?: string; field?: 'eyebrow'
}) {
  return <p data-magazine-field={field} className="text-[10px] uppercase tracking-[1.8px]" style={{ color, fontFamily: MONO }}>{children}</p>
}
export function Footer({ children, color = COLORS.body, field }: {
  children: ReactNode; color?: string; field?: 'footer'
}) {
  return <p data-magazine-field={field} className="text-[10px] uppercase tracking-[1.2px]" style={{ color, fontFamily: MONO }}>{children}</p>
}
export function Photo({ src, className = '', alt = '', position = 'center' }: {
  src: string; className?: string; alt?: string; position?: string
}) {
  return <img data-magazine-field="image" src={src} alt={alt} className={`block w-full object-cover ${className}`} style={{ objectPosition: position }} />
}
export function ProductPrice({ item, addToCart, productIndex }: {
  item: MagazineItem; addToCart: (id: string) => void; productIndex?: number
}) {
  return <button type="button" aria-label={`Add ${item.name} to cart`} onClick={() => addToCart(item.id)} data-magazine-field={productIndex === undefined ? undefined : 'productPrice'} data-magazine-product-index={productIndex} className="text-left" style={{ color: COLORS.ink, fontFamily: MONO, fontSize: 13 }}>{amount(item)}</button>
}
