import type { Magazine } from '../../types'
import { pageContent } from './templateCatalog'

export function MagazineTemplate({ magazine, variant }: { magazine: Magazine; variant: 'editorial' | 'catalog' }) {
  const catalog = variant === 'catalog'
  const pages = [...(magazine.pages ?? [])].sort((a, b) => a.position - b.position)
  return (
    <main className={`min-h-screen ${catalog ? 'bg-[#f1f5f9] text-slate-900' : 'bg-[#f8f5ef] text-[#26221e]'}`}>
      <header className={`mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-10 sm:pt-20 ${catalog ? 'border-b border-slate-200' : 'border-b border-[#ded6ca]'}`}>
        <p className={`text-xs font-bold uppercase tracking-[0.24em] ${catalog ? 'text-violet-600' : 'text-[#9b6b42]'}`}>{magazine.issue || 'Magazine'}</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">{magazine.name}</h1>
        {magazine.description && <p className="mt-6 max-w-2xl text-lg leading-8 opacity-70">{magazine.description}</p>}
        {magazine.coverImageUrl && <img src={magazine.coverImageUrl} alt="" className="mt-10 max-h-[520px] w-full object-cover" />}
      </header>
      <div className={`mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:px-10 sm:py-16 ${catalog ? 'md:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {pages.map((page) => {
          const content = pageContent(page.content)
          const copy = content.body || content.copy || ''
          const images = content.images?.length ? content.images : page.imageUrl ? [page.imageUrl] : []
          return (
            <article key={page.id} className={`overflow-hidden ${catalog ? 'rounded-2xl border border-slate-200 bg-white shadow-sm' : 'border-b border-[#ded6ca] pb-10'}`}>
              {images.length > 0 && <div className={`grid gap-2 ${images.length > 1 ? 'grid-cols-2' : ''}`}>{images.slice(0, 3).map((image, index) => <img key={`${image}-${index}`} src={image} alt={page.title || ''} style={{ objectPosition: content.imagePositions?.[index] || 'center' }} className={`w-full object-cover ${catalog ? 'aspect-[4/3]' : 'max-h-[420px]'}`} />)}</div>}
              <div className="p-5 sm:p-7">
                <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${catalog ? 'text-violet-600' : 'text-[#9b6b42]'}`}>{content.eyebrow || page.pageType}</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">{content.headline || page.title || 'Untitled page'}</h2>
                {content.quote && <p className="mt-4 text-lg italic leading-7 opacity-75">{content.quote}</p>}
                {copy && <p className="mt-5 whitespace-pre-wrap text-base leading-8 opacity-75">{copy}</p>}
                {content.footer && <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] opacity-50">{content.footer}</p>}
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}
