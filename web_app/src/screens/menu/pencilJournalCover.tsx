import type { MagazinePageContent } from '../../components/magazine/templateCatalog'
import { COLORS, IMAGES, SERIF, SANS, imagePosition } from './pencilJournalTheme'
import { Page, PageInner, Folio, Footer, Photo } from './pencilJournalPrimitives'

export default function Cover({
  image = IMAGES.cover,
  content,
}: {
  image?: string
  content?: MagazinePageContent
}) {
  const eyebrow = content?.eyebrow ?? 'THE CHEESE FACTORY · ISSUE 01 · AUTUMN'
  const headline = content?.headline ?? 'A good table starts here.'
  const body =
    content?.body ??
    'Cheese, preserves, crackers and the small things that turn a meal into an occasion.'
  const quote =
    content?.quote ??
    '“The best food invites everyone to stay a little longer.”'
  const footer = content?.footer ?? 'FROMAGE & CO. · MARKET LANE · 01'
  return (
    <Page background={COLORS.cream} className="relative">
      <div className="relative h-[590px] w-full">
        <Photo
          src={image}
          alt="A cheese board set for an evening table"
          className="h-full"
          position={imagePosition(content, 0)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/20" />
        <div className="absolute left-6 top-10 sm:left-[46px]">
          <Folio color={COLORS.cream} field="eyebrow">
            {eyebrow}
          </Folio>
        </div>
        <div className="absolute bottom-7 left-6 right-10 sm:left-[46px] sm:right-[100px]">
          <h1
            data-magazine-field="headline"
            className="text-[50px] leading-[.94] text-white sm:text-[62px]"
            style={{ fontFamily: SERIF, fontWeight: 400 }}
          >
            {headline}
          </h1>
          <p
            data-magazine-field="body"
            className="mt-4 max-w-[380px] text-[14px] leading-[1.35] text-white/85 sm:text-[16px]"
            style={{ fontFamily: SANS }}
          >
            {body}
          </p>
        </div>
      </div>
      <PageInner className="flex min-h-[310px] flex-col justify-between py-7 sm:py-[48px]">
        <Folio>
          INSIDE — THE PANTRY SHELF · FIERY LITTLE JARS · A BOARD FOR FOUR
        </Folio>
        <p
          data-magazine-field="quote"
          className="max-w-[550px] text-[29px] italic leading-[1.1] sm:text-[33px]"
          style={{ color: COLORS.ink, fontFamily: SERIF }}
        >
          {quote}
        </p>
        <Footer field="footer">{footer}</Footer>
      </PageInner>
    </Page>
  )
}
