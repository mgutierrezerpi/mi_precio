import type { MagazinePageContent } from '../../components/magazine/templateCatalog'
import { COLORS, IMAGES, SERIF, SANS, imagePosition } from './pencilJournalTheme'
import { Page, PageInner, Folio, Footer, Photo } from './pencilJournalPrimitives'

export default function Producer({
  content,
  image = IMAGES.producer,
}: {
  content?: MagazinePageContent
  image?: string
}) {
  return (
    <Page background="#F4EEE3">
      <PageInner>
        <Folio field="eyebrow">
          {content?.eyebrow ?? '04 · PEOPLE OF THE PASTURE'}
        </Folio>
        <Photo
          src={image}
          alt="A cheesemaker holding a wheel in the cellar"
          className="mt-8 h-[360px]"
          position={imagePosition(content, 0)}
        />
        <h2
          data-magazine-field="headline"
          className="mt-10 max-w-[520px] text-[43px] leading-[.98] sm:text-[49px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'The person behind the wheel.'}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-[395px_178px] sm:gap-[35px]">
          <p
            data-magazine-field="body"
            className="text-[14px] leading-[1.45] sm:text-[15px]"
            style={{ color: COLORS.body, fontFamily: SANS }}
          >
            {content?.body ??
              'Every Monday, Mara turns the milk from eight small farms into wheels that will wait quietly in the cellar for months. Her work is measured in patience, temperature and the exact sound a rind makes under her thumb.'}
          </p>
          <aside
            className="flex min-h-[160px] flex-col gap-2 bg-[#D6B58B] p-4"
            style={{ color: COLORS.ink }}
          >
            <span
              className="text-[38px] leading-none"
              style={{ fontFamily: SERIF }}
            >
              “
            </span>
            <p
              data-magazine-field="quote"
              className="text-[21px] italic leading-[1.1]"
              style={{ fontFamily: SERIF }}
            >
              {content?.quote ?? 'The cheese tells you what it needs.'}
            </p>
          </aside>
        </div>
        <div className="mt-24">
          <Footer field="footer">
            {content?.footer ?? 'FROMAGE & CO. · PORTRAIT SERIES · 04'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}
