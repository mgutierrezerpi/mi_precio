import type { MagazinePageContent } from '../../../components/magazine/templateCatalog'
import {
  COLORS,
  Footer,
  Folio,
  MONO,
  Page,
  SANS,
  SERIF,
  productsFor,
} from './aquaParts'

function Coupons({ content }: { content: MagazinePageContent }) {
  const products = productsFor(content, 'aqua-coupons')
  const labels = ['THE FIRST FIXTURE', 'THE BATHING ROOM', 'THE COMPLETE ROOM']
  return (
    <Page background={COLORS.coupons}>
      <div className="absolute left-[46px] top-[40px]">
        <Folio color="#5E5244" field>
          {content.eyebrow ?? '08 · PRIVILEGE INSERT'}
        </Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[78px] w-[560px] text-[47px] leading-[.96]"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'A few reasons to begin the room.'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[48px] top-[212px] w-[490px] text-[13px] leading-[1.4] text-[#5E5244]"
        style={{ fontFamily: SANS }}
      >
        {content.body ??
          'Keep this page close. Three invitations for a more considered bathroom, '
          + 'valid through the end of the season.'}
      </p>
      <div className="absolute left-[46px] top-[325px] flex w-[608px] flex-col gap-4">
        {products.slice(0, 3).map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="relative h-[145px] border border-[#5E5244] bg-[#F4EFE5] px-[22px] pt-[18px]"
          >
            <div className="flex gap-9">
              <Folio color="#8B7660">
                {String(index + 1).padStart(2, '0')}
              </Folio>
              <Folio color="#5E5244">{labels[index]}</Folio>
            </div>
            <p
              data-magazine-field="productName"
              data-magazine-product-index={index}
              className="mt-4 max-w-[420px] text-[25px] leading-[1.04]"
              style={{ fontFamily: SERIF }}
            >
              {product.name}
            </p>
            <p
              data-magazine-field="productDescription"
              data-magazine-product-index={index}
              className="absolute bottom-[17px] left-[22px] text-[10px] text-[#5E5244]"
              style={{ fontFamily: SANS }}
            >
              {product.description}
            </p>
            <div
              className="absolute right-[11px] top-[40px] flex h-[64px] w-[122px] flex-col"
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              <Folio color="#D6C8AD">PRESENT CODE</Folio>
              <p
                data-magazine-field="productPrice"
                data-magazine-product-index={index}
                className="text-[10px] tracking-[.4px] text-[#F4EFE5]"
                style={{ fontFamily: MONO }}
              >
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p
        data-magazine-field="quote"
        className="absolute left-[46px] top-[825px] w-[600px] text-[9px] leading-[1.35] text-[#5E5244]"
        style={{ fontFamily: SANS }}
      >
        {content.quote ??
          'One code per order. Not redeemable for cash. Full terms and exclusions at aquaedit.co/privilege.'}
      </p>
      <div className="absolute bottom-[10px] left-[46px]">
        <Footer color="#5E5244">
          {content.footer ?? 'AQUA / EDIT · PRIVILEGE · 08'}
        </Footer>
      </div>
    </Page>
  )
}

export default Coupons
