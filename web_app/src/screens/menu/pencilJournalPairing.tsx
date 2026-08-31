import type { MagazinePageContent } from '../../components/magazine/templateCatalog'
import { COLORS, IMAGES, SERIF, MONO, SANS, imagePosition } from './pencilJournalTheme'
import { Page, PageInner, Folio, Footer, Photo } from './pencilJournalPrimitives'

export default function Pairing({
  content,
  image = IMAGES.board,
}: {
  content?: MagazinePageContent
  image?: string
}) {
  const bodyParts = content?.body?.split('\n\n') ?? []
  const intro =
    bodyParts[0] ??
    (content?.body === undefined
      ? 'No rules, only a little balance: creamy, salty, bright, crisp and something with heat.'
      : '')
  const list =
    bodyParts.slice(1).join('\n\n') ||
    (content?.body === undefined
      ? '01  COASTAL BRIE + APRICOT JAM\n02  ALPINE GRUYÈRE + OLIVE OIL CRACKERS\n03  VALENÇAY + FERMENTED CHILLI SAUCE\n04  ADD FIGS, A KNIFE, A BOTTLE, FRIENDS'
      : '')
  return (
    <Page background={COLORS.dark} className="text-white">
      <PageInner>
        <Folio color="#E5BF8B" field="eyebrow">
          {content?.eyebrow ?? '03 · A BOARD FOR FOUR'}
        </Folio>
        <h2
          data-magazine-field="headline"
          className="mt-5 max-w-[480px] text-[44px] leading-[.96] sm:text-[52px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'Build a board that holds the room.'}
        </h2>
        <p
          data-magazine-field="body"
          className="mt-7 max-w-[430px] text-[14px] leading-[1.45] text-white/80 sm:text-[15px]"
          style={{ fontFamily: SANS }}
        >
          {intro}
        </p>
        <Photo
          src={image}
          alt="A cheese board with fruit, crackers and preserves"
          className="mt-14 h-[300px] sm:mt-[70px]"
          position={imagePosition(content, 0)}
        />
        <div
          data-magazine-field="body"
          className="mt-10 whitespace-pre-line text-[12px] leading-[2.1] tracking-[.2px] sm:text-[14px]"
          style={{ color: COLORS.cream, fontFamily: MONO }}
        >
          {list}
        </div>
        <div className="mt-20">
          <Footer color="#E5BF8B" field="footer">
            {content?.footer ?? 'FROMAGE &amp; CO. · A GOOD TABLE · 03'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}
