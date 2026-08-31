import type { MagazinePageContent } from '../../components/magazine/templateCatalog'
import { DEFAULT_PANTRY_PRODUCTS } from '../../components/magazine/templateCatalog'
import type { MagazineItem } from './pencilJournalTheme'
import { COLORS, IMAGES, SERIF, SANS, imagePosition } from './pencilJournalTheme'
import { Page, PageInner, Folio, Footer, Photo, ProductPrice } from './pencilJournalPrimitives'

export default function Pantry({
  itemFor,
  addToCart,
  content,
}: {
  itemFor: (name: string, price: string, description: string) => MagazineItem
  addToCart: (id: string) => void
  content?: MagazinePageContent
}) {
  const images = content?.images ?? []
  const products = (content?.products ?? DEFAULT_PANTRY_PRODUCTS).map(
    (product, index) => ({
      ...(content?.products?.[index] ?? product),
      image:
        images[index] ?? [IMAGES.jam, IMAGES.crackers, IMAGES.sauce][index],
    })
  )
  const eyebrow = content?.eyebrow ?? '02 · THE PANTRY SHELF'
  const headline = content?.headline ?? 'The accomplices'
  const intro =
    content?.body?.split('\n\n')[0] ??
    'Good cheese asks for good company. Three things we always keep close at hand.'
  const footer = content?.footer ?? 'FROMAGE & CO. · PANTRY GOODS · 02'
  return (
    <Page background={COLORS.pantry}>
      <PageInner>
        <Folio field="eyebrow">{eyebrow}</Folio>
        <h2
          data-magazine-field="headline"
          className="mt-5 text-[44px] leading-none sm:text-[50px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {headline}
        </h2>
        <p
          data-magazine-field="body"
          className="mt-2 max-w-[480px] text-[14px] leading-[1.4] sm:text-[15px]"
          style={{ color: COLORS.body, fontFamily: SANS }}
        >
          {intro}
        </p>
        <div className="mt-16 flex flex-col gap-10 sm:mt-[68px] sm:gap-[40px]">
          {products.map(({ name, price, description, image }, index) => {
            const item = {
              ...itemFor(name, price, description),
              name,
              price,
              description,
            }
            return (
              <div
                key={name}
                className="grid grid-cols-[128px_1fr] gap-5 sm:grid-cols-[196px_1fr] sm:gap-[34px]"
              >
                <Photo
                  src={image}
                  alt={name}
                  className="h-[170px]"
                  position={imagePosition(content, index)}
                />
                <div className="flex flex-col items-start gap-2 pt-1 sm:pt-[18px]">
                  <Folio color={COLORS.rust}>THE PANTRY / 03</Folio>
                  <h3
                    data-magazine-field="productName"
                    data-magazine-product-index={index}
                    className="text-[30px] leading-none sm:text-[35px]"
                    style={{ fontFamily: SERIF, fontWeight: 400 }}
                  >
                    {name}
                  </h3>
                  <p
                    data-magazine-field="productDescription"
                    data-magazine-product-index={index}
                    className="text-[12px] leading-[1.35] sm:text-[14px]"
                    style={{ color: COLORS.body, fontFamily: SANS }}
                  >
                    {description}
                  </p>
                  <ProductPrice
                    item={item}
                    addToCart={addToCart}
                    productIndex={index}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-14 sm:mt-[66px]">
          <Footer field="footer">{footer}</Footer>
        </div>
      </PageInner>
    </Page>
  )
}
