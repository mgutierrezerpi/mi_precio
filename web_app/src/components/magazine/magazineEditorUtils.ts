import type { Magazine, MagazinePage } from '../../types'
import { pageContent } from './templateCatalog'
import type { MagazineMetadataDraft, MagazinePageDraft } from './magazineEditorTypes'

export function metadataFrom(magazine: Magazine | null): MagazineMetadataDraft {
  return {
    name: magazine?.name ?? '',
    issue: magazine?.issue ?? '',
    description: magazine?.description ?? '',
    design:
      magazine?.slug === 'the_cheese_factory_journal'
        ? 'pencil-journal'
        : (magazine?.design ?? 'pencil-journal'),
    coverImageUrl: magazine?.coverImageUrl ?? '',
    published: Boolean(magazine?.published),
    showOnIndex: Boolean(magazine?.showOnIndex),
  }
}

export function pageDraftFrom(page: MagazinePage): MagazinePageDraft {
  const content = pageContent(page.content)
  const body = content.body || content.copy || ''
  const contentImages = content.images ?? []
  const positions = new Map(
    contentImages.map((source, index) => [
      source.trim(),
      content.imagePositions?.[index] || 'center',
    ])
  )
  const images = [
    ...new Set(
      [page.imageUrl ?? '', ...contentImages]
        .map((source) => source.trim())
        .filter(Boolean)
    ),
  ]
  return {
    position: page.position,
    pageType: page.pageType || 'editorial',
    layout: content.layout ?? '',
    title: page.title ?? content.headline ?? '',
    imageUrl: images[0] ?? '',
    images,
    imagePositions: images.map((source) => positions.get(source) || 'center'),
    eyebrow: content.eyebrow ?? '',
    headline: content.headline ?? page.title ?? '',
    body,
    quote: content.quote ?? '',
    footer: content.footer ?? '',
    copy: body,
    products: content.products,
  }
}

export function isPencilAsset(value: string) {
  return value.startsWith('/pencil/')
}
