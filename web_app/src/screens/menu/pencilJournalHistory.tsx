import type { MagazinePageContent } from '../../components/magazine/templateCatalog'
import { COLORS, IMAGES, SERIF, SANS, imagePosition } from './pencilJournalTheme'
import { Page, PageInner, Folio, Footer, Photo } from './pencilJournalPrimitives'

export default function History({
  content,
  image = IMAGES.history,
}: {
  content?: MagazinePageContent
  image?: string
}) {
  const bodyParts = content?.body?.split('\n\n') ?? []
  const intro =
    bodyParts[0] ??
    (content?.body === undefined
      ? 'In 1987, Clara and Émile found a damp cellar beneath a grocer’s shop and a handful of wheels worth waiting for. They borrowed a table, opened the door, and began cutting cheese for anyone who walked in.'
      : '')
  const timeline = bodyParts
    .slice(1)
    .flatMap((part) => part.split('\n'))
    .map((line) => {
      const match = line.match(/^(\d{4})\s+[—-]\s+(.*)$/)
      return match ? [match[1], match[2]] : null
    })
    .filter((item): item is [string, string] => Boolean(item))
  const defaultTimeline = [
    ['1987', 'A cellar, six wheels and a hand-painted sign.'],
    ['2002', 'The pantry shelf arrives: jam, crackers and mustard.'],
    ['2024', 'A longer table, and many more reasons to gather.'],
  ]
  return (
    <Page background={COLORS.history}>
      <PageInner>
        <Folio field="eyebrow">{content?.eyebrow ?? '07 · OUR HISTORY'}</Folio>
        <h2
          data-magazine-field="headline"
          className="mt-5 max-w-[560px] text-[44px] leading-[.98] sm:text-[52px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'From a borrowed cellar to a long table.'}
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-8 sm:mt-[70px] sm:grid-cols-[390px_184px] sm:gap-[34px]">
          <div>
            <Photo
              src={image}
              alt="The first cellar filled with cheese"
              className="h-[322px]"
              position={imagePosition(content, 0)}
            />
            <Folio color={COLORS.body}>
              THE FIRST CELLAR, MARKET LANE · 1987
            </Folio>
          </div>
          <div className="pt-1">
            <Folio>THE BEGINNING</Folio>
            <p
              data-magazine-field="body"
              className="mt-3 text-[13px] leading-[1.45] sm:text-[14px]"
              style={{ color: COLORS.body, fontFamily: SANS }}
            >
              {intro}
            </p>
          </div>
        </div>
        <div className="mt-20 grid grid-cols-3 gap-5 sm:mt-[82px] sm:gap-[20px]">
          {(content?.body === undefined && !timeline.length
            ? defaultTimeline
            : timeline
          ).map(([year, copy]) => (
            <div key={year}>
              <p
                className="text-[27px]"
                style={{ color: COLORS.rust, fontFamily: SERIF }}
              >
                {year}
              </p>
              <p
                data-magazine-field="body"
                className="mt-2 text-[12px] leading-[1.35]"
                style={{ color: COLORS.body, fontFamily: SANS }}
              >
                {copy}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-24">
          <Footer field="footer">
            {content?.footer ?? 'FROMAGE & CO. · THE STORY SO FAR · 07'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}
