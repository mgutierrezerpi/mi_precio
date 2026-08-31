import type { MagazinePageContent } from '../../components/magazine/templateCatalog'
import { COLORS, IMAGES, SERIF, SANS, imagePosition } from './pencilJournalTheme'
import { Page, PageInner, Folio, Footer, Photo } from './pencilJournalPrimitives'

export default function OneImage({
  content,
  image = IMAGES.table,
}: {
  content?: MagazinePageContent
  image?: string
}) {
  return (
    <Page background={COLORS.paper} className="min-h-[1000px]">
      <PageInner className="py-9 sm:py-[38px]">
        <Folio field="eyebrow">
          {content?.eyebrow ?? '09 · NOTES FROM THE COUNTER'}
        </Folio>
        <Photo
          src={image}
          alt="A quiet morning at the counter"
          className="mt-6 h-[230px]"
          position={imagePosition(content, 0)}
        />
        <Folio color={COLORS.body}>A QUIET MORNING AT THE COUNTER</Folio>
        <h2
          data-magazine-field="headline"
          className="mt-8 max-w-[470px] text-[44px] leading-none sm:text-[50px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'The small art of choosing well.'}
        </h2>
        <p
          data-magazine-field="quote"
          className="mt-8 max-w-[520px] text-[21px] italic leading-[1.2] sm:text-[24px]"
          style={{ color: COLORS.rust, fontFamily: SERIF }}
        >
          {content?.quote ??
            'A good shop is not a place that sells you everything. It is a place that helps you notice what is worth taking home.'}
        </p>
        <Folio color={COLORS.body}>
          WORDS BY CLARA VOSS · THE CHEESE FACTORY JOURNAL
        </Folio>
        <p
          data-magazine-field="body"
          className="mt-8 whitespace-pre-line text-[14px] leading-[1.46] sm:text-[15px]"
          style={{ color: '#4E4038', fontFamily: SANS }}
        >
          {content?.body ??
            'There are choices we make quickly, and then there are the ones that become part of how we live. At the counter, we see both. Some people come in for the familiar wedge they have bought every Friday for years. Others pause, ask a question, and leave with something they had never imagined bringing to their table.\n\nThe pleasure of a small food shop lies in that second moment. It is the gentle encouragement to try a cheese that needs a little room to breathe, a jam that tastes of a season you thought had passed, or a cracker so good it should never be treated as an afterthought.\n\nChoosing well is not about finding the rarest thing on the shelf. It is about finding the thing that will make dinner easier, kinder, and perhaps more memorable. A few pieces, a good loaf, something bright in a jar — and suddenly there is a table to gather around.'}
        </p>
        <div className="mt-10">
          <Footer field="footer">
            {content?.footer ?? 'FROMAGE & CO. · NOTES FROM THE COUNTER · 09'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}
