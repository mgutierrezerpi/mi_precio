import type { MagazinePageContent } from '../../components/magazine/templateCatalog'
import { COLORS, IMAGES, SERIF, SANS, imagePosition } from './pencilJournalTheme'
import { Page, PageInner, Folio, Footer, Photo } from './pencilJournalPrimitives'

export default function LongForm({
  content,
  images = [],
}: {
  content?: MagazinePageContent
  images?: string[]
}) {
  const body =
    content?.body ??
    'There is a point in every service when the room changes. The door is still open, the wine is still being poured, but suddenly the table begins to make sense. Someone passes the bread. A knife finds the soft centre of a ripe cheese. The conversation gathers itself around the small, practical pleasure of sharing.'
  return (
    <Page background={COLORS.paper} className="min-h-[1000px]">
      <PageInner className="py-9 sm:py-[38px]">
        <Folio field="eyebrow">
          {content?.eyebrow ?? '08 · THE LONG TABLE'}
        </Folio>
        <Photo
          src={images[0] || IMAGES.table}
          alt="A table prepared before guests arrive"
          className="mt-6 h-[156px] max-w-[300px]"
          position={imagePosition(content, 0)}
        />
        <Folio color={COLORS.body}>LUNCH, BEFORE THE FIRST GUEST ARRIVES</Folio>
        <h2
          data-magazine-field="headline"
          className="mt-9 max-w-[470px] text-[44px] leading-none sm:text-[50px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'Why we still set the table.'}
        </h2>
        <p
          data-magazine-field="quote"
          className="mt-8 max-w-[410px] text-[21px] italic leading-[1.2] sm:text-[24px]"
          style={{ color: COLORS.rust, fontFamily: SERIF }}
        >
          {content?.quote ??
            'A meal is more than a collection of plates. It is an invitation to slow the evening down.'}
        </p>
        <Folio color={COLORS.body}>
          WORDS BY CLARA VOSS · PHOTOGRAPHS BY THE MARKET LANE KITCHEN
        </Folio>
        <div className="mt-7 grid grid-cols-1 gap-8 sm:grid-cols-[355px_216px] sm:gap-[37px]">
          <p
            data-magazine-field="body"
            className="whitespace-pre-line text-[14px] leading-[1.46] sm:text-[15px]"
            style={{ color: '#4E4038', fontFamily: SANS }}
          >
            {body}
          </p>
          <div className="flex flex-col gap-8">
            <div>
              <Photo
                src={images[1] || IMAGES.gruyere}
                alt="A wedge of alpine gruyère"
                className="h-[162px]"
                position={imagePosition(content, 1)}
              />
              <Footer>A WEDGE OF ALPINE GRUYÈRE, WAITING FOR THE KNIFE.</Footer>
            </div>
            <div>
              <Photo
                src={images[2] || IMAGES.figs}
                alt="The last figs of the season"
                className="h-[144px]"
                position={imagePosition(content, 2)}
              />
              <Footer>THE LAST FIGS OF THE SEASON.</Footer>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Footer field="footer">
            {content?.footer ?? 'FROMAGE & CO. · THE LONG TABLE · 08'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}
