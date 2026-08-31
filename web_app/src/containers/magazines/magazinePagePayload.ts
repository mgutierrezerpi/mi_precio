import type { MagazinePageDraft } from '../../components/magazine/MagazineEditor'

export function toMagazinePagePayload(draft: MagazinePageDraft) {
  const sourceImages = draft.images.length ? draft.images : [draft.imageUrl]
  const primaryImage = draft.imageUrl.trim() || sourceImages[0]?.trim() || ''
  const orderedImages = [
    primaryImage,
    ...sourceImages
      .map((source) => source.trim())
      .filter((source) => source !== primaryImage),
  ].filter(Boolean)
  const positionByImage = new Map(
    sourceImages.map((source, index) => [
      source.trim(),
      draft.imagePositions[index] || 'center',
    ])
  )

  return {
    position: draft.position,
    pageType: draft.pageType,
    title: draft.title.trim() || null,
    imageUrl: primaryImage || null,
    content: {
      schema_version: 1,
      layout: draft.layout.trim() || undefined,
      eyebrow: draft.eyebrow.trim(),
      headline: draft.headline.trim(),
      body: draft.body,
      copy: draft.body || draft.copy,
      quote: draft.quote.trim(),
      footer: draft.footer.trim(),
      products: draft.products,
      images: orderedImages,
      imagePositions: orderedImages.map(
        (source) => positionByImage.get(source) || 'center'
      ),
    },
  }
}
