import type { MagazinePageContent } from '../../components/magazine/templateCatalog'
import { COLORS, IMAGES, SERIF, SANS, imagePosition } from './pencilJournalTheme'
import { Page, PageInner, Folio, Footer, Photo } from './pencilJournalPrimitives'

export default function Recipe({
  content,
  image = IMAGES.recipe,
}: {
  content?: MagazinePageContent
  image?: string
}) {
  const defaultSteps = [
    ['01', 'Butter both sides of good sourdough.'],
    ['02', 'Add gruyère, brie and a spoonful of apricot jam.'],
    ['03', 'Press in a hot pan until golden, molten and unreasonably good.'],
  ]
  const steps =
    content?.body !== undefined
      ? content.body
          .split('\n\n')
          .filter(Boolean)
          .map((step, index) => {
            const match = step.match(/^(\d{2})\s+(.*)$/s)
            return [
              match?.[1] ?? String(index + 1).padStart(2, '0'),
              match?.[2] ?? step,
            ]
          })
      : defaultSteps
  return (
    <Page background="#F6F1E9">
      <PageInner>
        <Folio field="eyebrow">
          {content?.eyebrow ?? '06 · A SIMPLE RECIPE'}
        </Folio>
        <h2
          data-magazine-field="headline"
          className="mt-5 max-w-[480px] text-[42px] leading-[.98] sm:text-[50px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'Grilled cheese, with an excellent jam.'}
        </h2>
        <Photo
          src={image}
          alt="Grilled cheese sandwich with apricot jam"
          className="mt-14 h-[300px] sm:mt-[70px] sm:h-[310px]"
          position={imagePosition(content, 0)}
        />
        <div className="mt-10 grid grid-cols-3 gap-4 sm:mt-[50px] sm:gap-[22px]">
          {steps.map(([number, copy]) => (
            <div key={number} className="flex flex-col gap-3">
              <Folio>{number}</Folio>
              <p
                data-magazine-field="body"
                className="text-[12px] leading-[1.35]"
                style={{ color: COLORS.body, fontFamily: SANS }}
              >
                {copy}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-32">
          <Footer field="footer">
            {content?.footer ?? 'FROMAGE & CO. · FROM THE KITCHEN · 06'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}
