import type { MagazinePageContent } from '../../components/magazine/templateCatalog'
import { DEFAULT_HOT_SHELF_PRODUCTS } from '../../components/magazine/templateCatalog'
import type { MagazineItem } from './pencilJournalTheme'
import { COLORS, IMAGES, SERIF, SANS, imagePosition } from './pencilJournalTheme'
import { Page, PageInner, Folio, Footer, Photo, ProductPrice } from './pencilJournalPrimitives'

export default function HotShelf({
  itemFor,
  addToCart,
  content,
}: {
  itemFor: (name: string, price: string, description: string) => MagazineItem
  addToCart: (id: string) => void
  content?: MagazinePageContent
}) {
  const images = content?.images ?? []
  const products = (content?.products ?? DEFAULT_HOT_SHELF_PRODUCTS).map(
    (product, index) => ({
      ...(content?.products?.[index] ?? product),
      image:
        images[index] ?? [IMAGES.chilli, IMAGES.pepper, IMAGES.mustard][index],
    })
  )
  return (
    <Page background={COLORS.orange}>
      <PageInner>
        <Folio color={COLORS.dark} field="eyebrow">
          {content?.eyebrow ?? '05 · THE HOT SHELF'}
        </Folio>
        <h2
          data-magazine-field="headline"
          className="mt-5 text-[48px] leading-none sm:text-[54px]"
          style={{ color: '#FFF7EC', fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'A little heat.'}
        </h2>
        <p
          data-magazine-field="body"
          className="mt-2 max-w-[410px] text-[14px] leading-[1.45] sm:text-[15px]"
          style={{ color: '#FFF7ECD9', fontFamily: SANS }}
        >
          {content?.body?.split('\n\n')[0] ??
            'Three bright jars for cheese, eggs, sandwiches and anything else that needs waking up.'}
        </p>
        <div className="mt-14 grid grid-cols-3 gap-3 sm:mt-[68px] sm:gap-[16px]">
          {products.map(({ name, price, description, image }, index) => {
            const item = {
              ...itemFor(description, price, description),
              name,
              price,
              description,
            }
            return (
              <div key={name}>
                <Photo
                  src={image}
                  alt={name}
                  className="h-[220px] sm:h-[300px]"
                  position={imagePosition(content, index)}
                />
                <p
                  data-magazine-field="productName"
                  data-magazine-product-index={index}
                  className="mt-3 text-[12px] leading-[1.1] sm:text-[14px]"
                  style={{ color: '#FFF7EC', fontFamily: SERIF }}
                >
                  {name}
                </p>
                <ProductPrice
                  item={item}
                  addToCart={addToCart}
                  productIndex={index}
                />
              </div>
            )
          })}
        </div>
        <p
          data-magazine-field="body"
          className="mt-14 max-w-[610px] text-[25px] leading-[1.15] sm:mt-[68px] sm:text-[30px]"
          style={{ color: COLORS.dark, fontFamily: SERIF }}
        >
          {content?.body?.split('\n\n').slice(1).join('\n\n') ||
            (content?.body === undefined
              ? 'Try the chilli crisp with creamy brie. The roasted pepper spread belongs under a slice of gruyère. Mustard is non-negotiable.'
              : '')}
        </p>
        <div className="mt-20">
          <Footer color={COLORS.dark} field="footer">
            {content?.footer ?? 'FROMAGE & CO. · PANTRY GOODS · 05'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}
