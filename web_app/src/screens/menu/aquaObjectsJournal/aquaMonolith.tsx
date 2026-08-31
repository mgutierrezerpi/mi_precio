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

function Monolith({ content }: { content: MagazinePageContent }) {
  const products = productsFor(content, 'aqua-monolith')
  return (
    <Page background={COLORS.paper}>
      <div className="absolute left-[46px] top-[40px]">
        <Folio field>{content.eyebrow ?? '02 · THE MONOLITH BATH'}</Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[78px] w-[570px] text-[48px] leading-[.96]"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'A bath as an object, not an afterthought.'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[48px] top-[224px] w-[480px] text-[14px] leading-[1.42] text-[#5F625C]"
        style={{ fontFamily: SANS }}
      >
        {content.body ??
          'One continuous form in mineral composite — quiet, substantial and made to hold the room.'}
      </p>
      <Photo
        src={content.images?.[0] ?? IMAGES.monolith}
        alt="An ivory freestanding bath beside a window"
        className="absolute left-[46px] top-[330px] h-[330px] w-[608px]"
        position={imagePosition(content, 0)}
      />
      <div className="absolute left-[46px] top-[705px] flex h-[76px] w-[608px] border-y border-[#B8B3A8]">
        {products.slice(0, 3).map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="flex flex-1 flex-col justify-center gap-[7px]"
          >
            <p
              data-magazine-field="productName"
              data-magazine-product-index={index}
              className="text-[9px] uppercase tracking-[.8px] text-[#746E62]"
              style={{ fontFamily: MONO }}
            >
              {product.name}
            </p>
            <p
              data-magazine-field="productPrice"
              data-magazine-product-index={index}
              className="text-[10px] font-semibold tracking-[.4px]"
              style={{ fontFamily: SANS }}
            >
              {product.price}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute bottom-[42px] left-[46px]">
        <Footer>{content.footer ?? 'AQUA / EDIT · OBJECT STUDY · 02'}</Footer>
      </div>
    </Page>
  )
}

export default Monolith

