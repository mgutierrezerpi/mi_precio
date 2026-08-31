import type { MagazinePageContent } from '../../../components/magazine/templateCatalog'
import {
  COLORS,
  Footer,
  Folio,
  IMAGES,
  MONO,
  Page,
  Photo,
  SANS,
  SERIF,
  imagePosition,
  productsFor,
} from './aquaParts'

function Fittings({ content }: { content: MagazinePageContent }) {
  const products = productsFor(content, 'aqua-fittings')
  return (
    <Page background={COLORS.dark} className="text-white">
      <div className="absolute left-[46px] top-[40px]">
        <Folio color={COLORS.sand} field>
          {content.eyebrow ?? '03 · CHROME, RECONSIDERED'}
        </Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[84px] w-[560px] text-[50px] leading-[.96] text-[#F5F1E8]"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'The line where water meets metal.'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[48px] top-[232px] w-[470px] text-[14px] leading-[1.42] text-[#D8D6CF]"
        style={{ fontFamily: SANS }}
      >
        {content.body ??
          'Fittings should feel inevitable: precise in the hand, almost invisible in the composition.'}
      </p>
      <Photo
        src={content.images?.[0] ?? IMAGES.fittings}
        alt="A wall-mounted brass tap against dark green stone"
        className="absolute left-[46px] top-[355px] h-[255px] w-[608px]"
        position={imagePosition(content, 0)}
      />
      <div className="absolute left-[48px] top-[656px] flex w-[560px] flex-col gap-4">
        {products.slice(0, 3).map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="grid grid-cols-[44px_1fr_1fr] items-center gap-0"
          >
            <span
              className="text-[10px] text-[#D5C8A9]"
              style={{ fontFamily: MONO }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <p
              data-magazine-field="productName"
              data-magazine-product-index={index}
              className="text-[22px] leading-none text-[#F5F1E8]"
              style={{ fontFamily: SERIF }}
            >
              {product.name}
            </p>
            <p
              data-magazine-field="productPrice"
              data-magazine-product-index={index}
              className="text-[9px] tracking-[.5px] text-[#D8D6CF]"
              style={{ fontFamily: MONO }}
            >
              {product.price}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute bottom-[42px] left-[46px]">
        <Footer color={COLORS.sand}>
          {content.footer ?? 'AQUA / EDIT · FITTINGS · 03'}
        </Footer>
      </div>
    </Page>
  )
}

export default Fittings

