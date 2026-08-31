import type { MagazinePage } from '../../types'
import { pageContent, type MagazinePageContent } from '../../components/magazine/templateCatalog'
import type { MagazineItem } from './pencilJournalTheme'
import { IMAGES, imagePosition, COLORS, SERIF, SANS } from './pencilJournalTheme'
import Cover from './pencilJournalCover'
import Pantry from './pencilJournalPantry'
import Pairing from './pencilJournalPairing'
import Producer from './pencilJournalProducer'
import HotShelf from './pencilJournalHotShelf'
import Recipe from './pencilJournalRecipe'
import History from './pencilJournalHistory'
import LongForm from './pencilJournalLongForm'
import OneImage from './pencilJournalOneImage'
import { PencilLayoutForPage } from './pencilJournalControls'
import { Page, PageInner, Folio, Footer, Photo } from './pencilJournalPrimitives'
export function EditableJournalPage({
  page,
  coverImage,
  itemFor,
  addToCart,
}: {
  page: MagazinePage
  coverImage?: string | null
  itemFor: (name: string, price: string, description: string) => MagazineItem
  addToCart: (id: string) => void
}) {
  const content = pageContent(page.content)
  const images = content.images ?? (page.imageUrl ? [page.imageUrl] : [])
  const image = images[0] ?? coverImage ?? undefined
  const layout = PencilLayoutForPage(page, content)
  if (layout === 'cover') return <Cover image={image} content={content} />
  if (layout === 'pantry')
    return <Pantry itemFor={itemFor} addToCart={addToCart} content={content} />
  if (layout === 'pairing')
    return <Pairing image={image || IMAGES.board} content={content} />
  if (layout === 'profile')
    return <Producer image={image || IMAGES.producer} content={content} />
  if (layout === 'hot-shelf')
    return (
      <HotShelf itemFor={itemFor} addToCart={addToCart} content={content} />
    )
  if (layout === 'recipe')
    return <Recipe image={image || IMAGES.recipe} content={content} />
  if (layout === 'history')
    return <History image={image || IMAGES.history} content={content} />
  if (layout === 'long-form')
    return <LongForm images={images} content={content} />
  if (layout === 'one-image')
    return <OneImage image={image || IMAGES.table} content={content} />
  return <EditableEditorialPage page={page} content={content} images={images} />
  }
function EditableEditorialPage({
  page,
  content,
  images,
}: {
  page: MagazinePage
  content: MagazinePageContent
  images: string[]
}) {
  const fallbackImages: Record<string, string> = {
    cover: IMAGES.cover,
    editorial: IMAGES.board,
    profile: IMAGES.producer,
    catalog: IMAGES.chilli,
    recipe: IMAGES.recipe,
    history: IMAGES.history,
    notes: IMAGES.table,
  }
  const image = page.imageUrl ?? fallbackImages[page.pageType]
  const displayImages =
    content.images !== undefined
      ? content.images
      : images.length
        ? images
        : image
          ? [image]
          : []
  const eyebrow =
    content.eyebrow ??
    `${String(page.position + 1).padStart(2, '0')} · ${page.pageType}`
  const headline = content.headline ?? page.title ?? 'Editorial page'
  const body = content.body ?? content.copy ?? ''
  const quote = content.quote ?? ''
  const background =
    page.pageType === 'profile'
      ? COLORS.history
      : page.pageType === 'catalog'
        ? COLORS.orange
        : COLORS.paper
  return (
    <Page background={background}>
      <PageInner>
        <Folio
          field="eyebrow"
          color={page.pageType === 'catalog' ? COLORS.dark : COLORS.rust}
        >
          {eyebrow}
        </Folio>
        {displayImages.length > 0 && (
          <div
            className={`mt-6 grid gap-3 ${displayImages.length > 1 ? 'grid-cols-2' : ''}`}
          >
            {displayImages.slice(0, 3).map((source, index) => (
              <Photo
                key={`${source}-${index}`}
                src={source}
                alt={headline}
                className="max-h-[350px]"
                position={imagePosition(content, index)}
              />
            ))}
          </div>
        )}
        <h2
          data-magazine-field="headline"
          className="mt-8 max-w-[580px] text-[44px] leading-[.98] sm:text-[54px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {headline}
        </h2>
        <p
          data-magazine-field="quote"
          className="mt-6 min-h-[1.2em] max-w-[560px] text-[22px] italic leading-[1.2] sm:text-[26px]"
          style={{ color: COLORS.rust, fontFamily: SERIF }}
        >
          {quote}
        </p>
        <p
          data-magazine-field="body"
          className="mt-8 min-h-[1.5em] max-w-[580px] whitespace-pre-wrap text-[16px] leading-[1.5] sm:text-[18px]"
          style={{
            color: page.pageType === 'catalog' ? COLORS.dark : COLORS.body,
            fontFamily: SANS,
          }}
        >
          {body}
        </p>
        <div className="mt-28">
          <Footer
            field="footer"
            color={page.pageType === 'catalog' ? COLORS.dark : COLORS.body}
          >
            {content.footer ??
              `FROMAGE & CO. · ${headline} · ${String(page.position + 1).padStart(2, '0')}`}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )}
